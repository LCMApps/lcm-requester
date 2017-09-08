'use strict';

const _ = require('lodash');
const request = require('request');
const GlobalSettings = require('./GlobalSettings');
const {assertResponse} = require('src/ResponseAssert');
const {RequestError} = require('./Error');


function promisifiedRequest(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, response, responseBody) => {
            if (err) {
                return reject(new RequestError(err, options.url));
            }

            resolve({ response, responseBody });
        });
    });
}

function assertTimeout(timeoutMsec) {
    if (timeoutMsec !== undefined && !Number.isSafeInteger(timeoutMsec) || timeoutMsec < 0) {
        throw new TypeError('timeout must be a positive integer');
    }
}

function assertSerializable(params) {
    if (typeof params === 'undefined') {
        throw new TypeError('POST body must be explicitly specified');
    }

    if (
        typeof params !== 'string' && typeof params !== 'boolean' &&
        typeof params !== 'number' && typeof params !== 'object' &&
        !_.isPlainObject(params)
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
                    assertTimeout(timeoutMsec);

                    const opts = {
                        url: url,
                        method: 'GET',
                        json: true,
                        timeout: timeoutMsec ? timeoutMsec : globalSettings.getTimeout()
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
                    assertTimeout(timeoutMsec);
                    const opts = {
                        url: url,
                        method: 'POST',
                        timeout: timeoutMsec ? timeoutMsec : globalSettings.getTimeout()
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
                        const parsed = JSON.parse(response.responseBody);
                        response.responseBody = parsed;
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
                    assertTimeout(timeoutMsec);
                    const opts = {
                        url: url,
                        method: 'POST',
                        timeout: timeoutMsec ? timeoutMsec : globalSettings.getTimeout(),
                        json: true
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
                    assertTimeout(timeoutMsec);

                    const opts = {
                        url: url,
                        method: 'DELETE',
                        json: true,
                        timeout: timeoutMsec ? timeoutMsec : globalSettings.getTimeout()
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
