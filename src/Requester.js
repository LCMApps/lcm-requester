'use strict';

const _ = require('lodash');
const http = require('http');
const https = require('https');
const request = require('request');
const {lookup} = require('dns-lookup-cache');

const {assertResponse} = require('./ResponseAssert');
const {RequestError} = require('./Error');

const supportedIpFamily = 4;

function promisifiedRequest(options) {
    return new Promise((resolve, reject) => {
        const meta = {
            url: options.url
        };

        request(options, (err, response, responseBody) => {
            if (err) {
                return reject(new RequestError(err, meta));
            }

            resolve({response, responseBody});
        }).on('socket', socket => {
            socket.on('lookup', (err, address) => {
                if (address) {
                    meta.remoteAddress = address;
                }
            });
        });
    });
}

function assertPositiveInteger(value, propertyName = 'timeoutMsecs') {
    if (value !== undefined && !Number.isSafeInteger(value) || value < 0) {
        throw new TypeError(`${propertyName} must be a positive integer`);
    }
}

function assertSerializable(params) {
    if (params === undefined) {
        throw new TypeError('Request body must be explicitly specified');
    }

    if (
        !_.isPlainObject(params) && !_.isNull(params) &&
        !_.isString(params) && !_.isBoolean(params) &&
        !_.isNumber(params) && !_.isArray(params)
    ) {
        throw new TypeError('params must be serializable value');
    }
}

const DEFAULT_REQUEST_TIMEOUT = 30000;

class Requester {
    constructor(config) {
        if (config !== undefined && !_.isPlainObject(config)) {
            throw new TypeError('config must be a plain object');
        }

        this._config = config ? _.cloneDeep(config) : {};

        assertPositiveInteger(this._config.timeoutMsecs, 'config.timeoutMsecs');

        if (this._config.timing !== undefined && !_.isBoolean(config.timing)) {
            throw new TypeError('config.timing must be a boolean');
        }

        if (this._config.agentOptions !== undefined) {
            if (!_.isPlainObject(this._config.agentOptions)) {
                throw new TypeError('config.agentOptions must be a plain object');
            }

            if (this._config.agentOptions.keepAlive !== undefined
                && !_.isBoolean(this._config.agentOptions.keepAlive)
            ) {
                throw new TypeError('config.agentOptions.keepAlive must be a boolean');
            }

            assertPositiveInteger(this._config.agentOptions.keepAliveMsecs, 'config.agentOptions.keepAliveMsecs');

            if (this._config.agentOptions.maxSockets !== undefined && !_.isNumber(this._config.agentOptions.maxSockets)
                || ((!Number.isSafeInteger(this._config.agentOptions.maxSockets)
                    || this._config.agentOptions.maxSockets < 0)
                    && Number.isFinite(this._config.agentOptions.maxSockets))
            ) {
                throw new TypeError('config.agentOptions.maxSockets must be a positive integer or Infinity');
            }

            assertPositiveInteger(this._config.agentOptions.maxFreeSockets, 'config.agentOptions.maxFreeSockets');
            assertPositiveInteger(this._config.agentOptions.timeout, 'config.agentOptions.timeout');
        }

        this._timeoutMsecs = this._config.timeoutMsecs || DEFAULT_REQUEST_TIMEOUT;
        this._timing = this._config.timing || false;
        this._agentOptions = this._config.agentOptions ? _.cloneDeep(this._config.agentOptions) : {};
        this._httpAgent = null;
        this._httpsAgent = null;
    }

    getTimeout() {
        return this._timeoutMsecs;
    }

    getTiming() {
        return this._timing;
    }

    getAgentOptions() {
        return this._agentOptions;
    }

    getRequest(url, params, timeoutMsecs = undefined) {
        return Promise.resolve()
            .then(() => {
                const timeout = timeoutMsecs ? timeoutMsecs : this._timeoutMsecs;
                assertPositiveInteger(timeout);

                const opts = {
                    url: url,
                    method: 'GET',
                    json: true,
                    timeout: timeout,
                    lookup: lookup,
                    family: supportedIpFamily,
                    agent: this._getAgent(url),
                    time: this._timing
                };

                if (params !== undefined && (!_.isPlainObject(params) || _.isArray(params))) {
                    throw new TypeError('params must be an object');
                }

                if (params !== undefined && !_.isEmpty(params)) {
                    opts.qs = params;
                }

                return promisifiedRequest(opts);
            })
            .then(response => {
                assertResponse(response);
                return response;
            });
    }

    postFormUrlencodedRequest(url, params, timeoutMsecs = undefined) {
        return Promise.resolve()
            .then(() => {
                const timeout = timeoutMsecs ? timeoutMsecs : this._timeoutMsecs;
                assertPositiveInteger(timeout);

                const opts = {
                    url: url,
                    method: 'POST',
                    timeout: timeout,
                    lookup: lookup,
                    family: supportedIpFamily,
                    agent: this._getAgent(url),
                    time: this._timing
                };

                if (params !== undefined && (!_.isPlainObject(params) || _.isArray(params))) {
                    throw new TypeError('params must be an object');
                }

                if (params !== undefined && !_.isEmpty(params)) {
                    opts.form = params;
                }

                return promisifiedRequest(opts);
            })
            .then(response => {
                try {
                    response.responseBody = JSON.parse(response.responseBody);
                } catch (err) {
                    // validator will catch it
                }

                assertResponse(response);

                return response;
            });
    }

    postJsonRequest(url, params, timeoutMsecs = undefined) {
        return Promise.resolve()
            .then(() => {
                const timeout = timeoutMsecs ? timeoutMsecs : this._timeoutMsecs;
                assertPositiveInteger(timeout);

                const opts = {
                    url: url,
                    method: 'POST',
                    timeout: timeout,
                    json: true,
                    lookup: lookup,
                    family: supportedIpFamily,
                    agent: this._getAgent(url),
                    time: this._timing
                };

                assertSerializable(params);
                opts.body = params;

                return promisifiedRequest(opts);
            })
            .then(response => {
                assertResponse(response);

                return response;
            });
    }

    deleteRequest(url, params, body, timeoutMsecs = undefined) {
        return Promise.resolve()
            .then(() => {
                const timeout = timeoutMsecs ? timeoutMsecs : this._timeoutMsecs;
                assertPositiveInteger(timeout);

                const opts = {
                    url: url,
                    method: 'DELETE',
                    json: true,
                    timeout: timeout,
                    lookup: lookup,
                    family: supportedIpFamily,
                    agent: this._getAgent(url),
                    time: this._timing
                };

                if (params !== undefined && (!_.isPlainObject(params) || _.isArray(params))) {
                    throw new TypeError('params must be an object');
                }

                if (params !== undefined && !_.isEmpty(params)) {
                    opts.qs = params;
                }

                if (body !== undefined) {
                    assertSerializable(body);
                    opts.body = body;
                }

                return promisifiedRequest(opts);
            })
            .then(response => {
                assertResponse(response);
                return response;
            });
    }

    _getAgent(url) {
        const isHttps = url.startsWith('https');

        if (isHttps) {
            if (this._httpsAgent === null) {
                this._httpsAgent = new https.Agent(this._agentOptions);
            }

            return this._httpsAgent;
        } else {
            if (this._httpAgent === null) {
                this._httpAgent = new http.Agent(this._agentOptions);
            }

            return this._httpAgent;
        }
    }
}

module.exports = Requester;
