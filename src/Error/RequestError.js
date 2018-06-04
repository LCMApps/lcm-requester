'use strict';

const ExtendableError = require('./ExtendableError');

class RequestError extends ExtendableError {
    constructor(parentError, meta) {
        super(`Error happened: ${parentError.message}`, {parentError, meta});
    }
}

module.exports = RequestError;
