const _ = require('lodash');
const {assert} = require('chai');
const crypto = require('crypto');
const InvalidResponseFormatError = require('src/Error/InvalidResponseFormatError');

describe('Unit: Error/InvalidResponseFormatError', () => {
    it('error with string as responseBody', () => {
        const errorMessage = 'some message';
        const response = {
            responseBody: 'text message',
            response: {
                statusCode: 200,
                request: {
                    href: 'http://google.com'
                }
            }
        };
        const expectedExtra = {
            responseBody: 'text message',
            statusCode: 200,
            uri: 'http://google.com'
        };

        const err = new InvalidResponseFormatError(errorMessage, _.cloneDeep(response));

        assert.equal(err.message, errorMessage);
        assert.deepEqual(err.extra, expectedExtra);
    });

    it('error with object as responseBody', () => {
        const errorMessage = 'some message';
        const response = {
            responseBody: {some: 'object'},
            response: {
                statusCode: 200,
                request: {
                    href: 'http://google.com'
                }
            }
        };
        const expectedExtra = {
            responseBody: '{"some":"object"}',
            statusCode: 200,
            uri: 'http://google.com'
        };

        const err = new InvalidResponseFormatError(errorMessage, _.cloneDeep(response));

        assert.equal(err.message, errorMessage);
        assert.deepEqual(err.extra, expectedExtra);
    });

    it('error with near threshold string as responseBody', () => {
        const errorMessage = 'some message';

        const trimSize = 8192;
        const longBody = crypto.randomBytes(trimSize / 2).toString('hex');
        const expectedTrimmedBody = longBody;

        const response = {
            responseBody: longBody,
            response: {
                statusCode: 200,
                request: {
                    href: 'http://google.com'
                }
            }
        };
        const expectedExtra = {
            responseBody: expectedTrimmedBody,
            statusCode: 200,
            uri: 'http://google.com'
        };

        const err = new InvalidResponseFormatError(errorMessage, _.cloneDeep(response));

        assert.equal(err.message, errorMessage);
        assert.deepEqual(err.extra, expectedExtra);
    });

    it('error with string above threshold as responseBody', () => {
        const errorMessage = 'some message';

        const trimSize = 8192;
        const longBody = crypto.randomBytes(trimSize / 2 + 1).toString('hex');
        const expectedTrimmedBody = longBody.substr(0, trimSize) + '...';

        const response = {
            responseBody: longBody,
            response: {
                statusCode: 200,
                request: {
                    href: 'http://google.com'
                }
            }
        };
        const expectedExtra = {
            responseBody: expectedTrimmedBody,
            statusCode: 200,
            uri: 'http://google.com'
        };

        const err = new InvalidResponseFormatError(errorMessage, _.cloneDeep(response));

        assert.equal(err.message, errorMessage);
        assert.deepEqual(err.extra, expectedExtra);
    });
});
