'use strict';

const ExtendableError = require('./ExtendableError');

class RequestError extends ExtendableError {
    constructor(parentError, url) {
        super(`Error happened: ${parentError.message}`, {parentError, url});
    }
}

module.exports = RequestError;
