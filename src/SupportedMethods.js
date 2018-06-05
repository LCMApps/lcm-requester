'use strict';

const _ = require('lodash');
const request = require('request');

const {lookup} = require('dns-lookup-cache');

const GlobalSettings = require('./GlobalSettings');
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

            resolve({ response, responseBody });
        }).on('socket', socket => {
            socket.on('lookup', (err, address) => {
                if (address) {
                    meta.remoteAddress = socket.remoteAddress;
                }
            });
        });
    });
}

function assertTimeout(timeoutMsec) {
    if (timeoutMsec !== undefined && !Number.isSafeInteger(timeoutMsec) || timeoutMsec < 0) {
        throw new TypeError('timeout must be a positive integer');
    }
}

function assertSerializable(params) {
    if (params === undefined) {
        throw new TypeError('POST body must be explicitly specified');
    }

    if (
        !_.isPlainObject(params) && !_.isNull(params) &&
        !_.isString(params) && !_.isBoolean(params) &&
        !_.isNumber(params) && !_.isArray(params)
    ) {
        throw new TypeError('params must be serializable value');
    }
}

module.exports = function (globalSettings) {
    if (!(globalSettings instanceof GlobalSettings)) {
        throw new TypeError('Global settings is broken');
    }

    return {
        getRequest: function getRequest(url, params, timeoutMsec = undefined) {
            return Promise.resolve()
                .then(() => {
                    const timeout = timeoutMsec ? timeoutMsec : globalSettings.getTimeout();
                    assertTimeout(timeout);

                    const opts = {
                        url: url,
                        method: 'GET',
                        json: true,
                        timeout: timeout,
                        lookup: lookup,
                        family: supportedIpFamily,
                        time: globalSettings.getTiming()
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
        },
        postFormUrlencodedRequest: function postFormUrlencodedRequest(url, params, timeoutMsec = undefined) {
            return Promise.resolve()
                .then(() => {
                    const timeout = timeoutMsec ? timeoutMsec : globalSettings.getTimeout();
                    assertTimeout(timeout);

                    const opts = {
                        url: url,
                        method: 'POST',
                        timeout: timeout,
                        lookup: lookup,
                        family: supportedIpFamily,
                        time: globalSettings.getTiming()
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
        },
        postJsonRequest: function postJsonRequest(url, params, timeoutMsec = undefined) {
            return Promise.resolve()
                .then(() => {
                    const timeout = timeoutMsec ? timeoutMsec : globalSettings.getTimeout();
                    assertTimeout(timeout);

                    const opts = {
                        url: url,
                        method: 'POST',
                        timeout: timeout,
                        json: true,
                        lookup: lookup,
                        family: supportedIpFamily,
                        time: globalSettings.getTiming()
                    };

                    assertSerializable(params);
                    opts.body = params;

                    return promisifiedRequest(opts);
                })
                .then(response => {
                    assertResponse(response);

                    return response;
                });
        },
        deleteRequest: function getRequest(url, params, timeoutMsec = undefined) {
            return Promise.resolve()
                .then(() => {
                    const timeout = timeoutMsec ? timeoutMsec : globalSettings.getTimeout();
                    assertTimeout(timeout);

                    const opts = {
                        url: url,
                        method: 'DELETE',
                        json: true,
                        timeout: timeout,
                        lookup: lookup,
                        family: supportedIpFamily,
                        time: globalSettings.getTiming()
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
        },
    };
};
