'use strict';

const ExtendableError = require('./ExtendableError');

const MAX_RESPONSE_BODY_SIZE = 8192;

class InvalidResponseFormatError extends ExtendableError {
    constructor(message, response) {
        let responseText;

        if (typeof response.responseBody === 'string') {
            responseText = response.responseBody;
        } else {
            responseText = JSON.stringify(response.responseBody);
        }

        const responseBody = responseText.length > MAX_RESPONSE_BODY_SIZE ?
            responseText.substring(0, MAX_RESPONSE_BODY_SIZE) + '...' :
            responseText;

        super(message, {
            statusCode:   response.response.statusCode,
            uri:          response.response.request.href,
            responseBody: responseBody
        });
    }
}

module.exports = InvalidResponseFormatError;
