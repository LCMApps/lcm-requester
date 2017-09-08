const {InvalidResponseFormatError} = require('src/Error');

module.exports = {
    invalidResponseFormat: [
        {
            descr: '200 OK response with string instead of json',
            response: {
                statusCode: 200,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: '200 OK response must contain "data" field'
        },
        {
            descr: '200 OK response with json with no "data" field',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 200,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: '',
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Response body is not a json'
        },
        {
            descr: '400 Bad Request response with string instead of json',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: '',
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Response body is not a json'
        },
        {
            descr: '400 Bad Request response with json with no "error" field',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain both "error.code" and "error.message" fields'
        },
        {
            descr: '400 Bad Request response with json with "error" field not an object',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: ''},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain both "error.code" and "error.message" fields'
        },
        {
            descr: '400 Bad Request response with json with an empty object as an "error" field',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {}},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain both "error.code" and "error.message" fields'
        },
        {
            descr: '400 Bad Request response with json with absent "error.message" field',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {code: 123}},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain both "error.code" and "error.message" fields'
        },
        {
            descr: '400 Bad Request response with json with "error.code" field not an int',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {code: '123', message: 'smth'}},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain positive int as an "error.code'
        },
        {
            descr: '400 Bad Request response with json with a negative value of "error.code"',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {code: -1, message: 'smth'}},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain positive int as an "error.code'
        },
        {
            descr: '400 Bad Request response with json with non int value of "error.code"',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {code: 12.34, message: 'smth'}},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain positive int as an "error.code'
        },
        {
            descr: '400 Bad Request response with json with not a string value of "error.message"',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {code: 1, message: false}},
            expectedErrorType: InvalidResponseFormatError,
            expectedErrorMessage: 'Not 200 OK response must contain string as an "error.message"'
        }
    ],

    validResponseFormat: [
        {
            descr: '200 OK response with null data',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 200,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {data: null},
        },
        {
            descr: '200 OK response with bool',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 200,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {data: false},
        },
        {
            descr: '200 OK response with object',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 200,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {data: {}},
        },
        {
            descr: '400 Bad Request response with empty message',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {code: 1, message: ''}},
        },
        {
            descr: '400 Bad Request response with non-empty message',
            url: 'http://127.0.0.1/path',
            response: {
                statusCode: 400,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            },
            responseBody: {error: {code: 1, message: 'smth'}},
        }
    ],
};
