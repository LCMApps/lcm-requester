const _ = require('lodash');
const {InvalidResponseFormatError} = require('src/Error');

function assertResponseBody(response) {
    if (!_.isObject(response.responseBody)) {
        throw new InvalidResponseFormatError('Response body is not a json', response);
    }
}

function assertDataIsObject(response) {
    if (!_.has(response.responseBody, 'data')) {
        throw new InvalidResponseFormatError('200 OK response must contain "data" field', response);
    }
}

function assertErrorObject(response) {
    if (!_.has(response.responseBody, 'error.code') ||
        !_.has(response.responseBody, 'error.message')
    ) {
        throw new InvalidResponseFormatError(
            'Not 200 OK response must contain both "error.code" and "error.message" fields',
            response
        );
    }
}

function assertErrorCode(response) {
    const code = response.responseBody.error.code;
    if (!Number.isSafeInteger(code) || code < 0) {
        throw new InvalidResponseFormatError(
            'Not 200 OK response must contain positive int as an "error.code"',
            response
        );
    }
}

function assertErrorMessage(response) {
    const message = response.responseBody.error.message;
    if (typeof message !== 'string') {
        throw new InvalidResponseFormatError(
            'Not 200 OK response must contain string as an "error.message"',
            response
        );
    }
}

module.exports = {
    assertResponse: function assertResponse(response) {
        assertResponseBody(response);

        if (response.response.statusCode === 200) {
            assertDataIsObject(response);
        } else {
            assertErrorObject(response);
            assertErrorCode(response);
            assertErrorMessage(response);
        }
    }
};
