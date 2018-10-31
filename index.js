'use strict';

const GlobalSettings = require('./src/GlobalSettings');
const ResponseAssert = require('./src/ResponseAssert');
const errors = require('./src/Error');

const globalSettings = new GlobalSettings();
const supportedMethods = require('./src/SupportedMethods')(globalSettings);

module.exports = {
    getTimeout: globalSettings.getTimeout.bind(globalSettings),
    setTimeout: globalSettings.setTimeout.bind(globalSettings),
    getTiming: globalSettings.getTiming.bind(globalSettings),
    setTiming: globalSettings.setTiming.bind(globalSettings),
    setAgentOptions: globalSettings.setAgentOptions.bind(globalSettings),
    getAgentOptions: globalSettings.getAgentOptions.bind(globalSettings),
    getRequest: supportedMethods.getRequest,
    postFormUrlencodedRequest: supportedMethods.postFormUrlencodedRequest,
    postJsonRequest: supportedMethods.postJsonRequest,
    deleteRequest: supportedMethods.deleteRequest,
    assertResponse: ResponseAssert.assertResponse,
    errors: errors
};
