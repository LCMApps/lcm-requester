const _ = require('lodash');
const nock = require('nock');
const http = require('http');
const getPort = require('get-port');
const {assert} = require('chai');

const GlobalSettings = require('src/GlobalSettings');
const SupportedMethodsInitializer = require('src/SupportedMethods');
const {RequestError} = require('src/Error');

const globaSettings = new GlobalSettings();
const {getRequest} = SupportedMethodsInitializer(globaSettings);

describe('Functional: SupportedMethods::getRequest', () => {
    describe('nock based', () => {
        before(() => {
            nock.disableNetConnect();
        });

        after(() => {
            nock.enableNetConnect();
            nock.cleanAll();
        });

        beforeEach(() => {
            nock.cleanAll();
        });
        afterEach(function () {
            nock.cleanAll();
        });

        it('request without params argument', () => {
            const expectedPath = '/path';
            const expectedQueryString = {};
            const expectedResponse = {data: {value: 321}};

            const nockInstance = nock('http://127.0.0.1')
                .get(expectedPath)
                .query(_.cloneDeep(expectedQueryString))
                .reply(200, _.cloneDeep(expectedResponse));

            return getRequest('http://127.0.0.1/path')
                .then(response => {
                    nockInstance.done();
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with qs in path', () => {
            const expectedPath = '/path';
            const expectedQueryString = {arg1: 'val1'};
            const expectedResponse = {data: {value: 321}};

            const nockInstance = nock('http://127.0.0.1')
                .get(expectedPath)
                .query(_.cloneDeep(expectedQueryString))
                .reply(200, _.cloneDeep(expectedResponse));

            return getRequest('http://127.0.0.1/path?arg1=val1')
                .then(response => {
                    nockInstance.done();
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with qs in uri and params', () => {
            const expectedPath = '/path';
            const expectedQueryString = {arg1: 'val1'};
            const expectedResponse = {data: {value: 321}};

            const nockInstance = nock('http://127.0.0.1')
                .get(expectedPath)
                .query(_.cloneDeep(expectedQueryString))
                .reply(200, _.cloneDeep(expectedResponse));

            return getRequest('http://127.0.0.1/path?arg1=valinuri', {arg1: 'val1'})
                .then(response => {
                    nockInstance.done();
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with 400 response', () => {
            const expectedPath = '/path';
            const expectedQueryString = {};
            const expectedResponse = {error: {code: 1, message: 'some message'}};

            const nockInstance = nock('http://127.0.0.1')
                .get(expectedPath)
                .query(_.cloneDeep(expectedQueryString))
                .reply(400, _.cloneDeep(expectedResponse));

            return getRequest('http://127.0.0.1/path', {})
                .then(response => {
                    nockInstance.done();
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with emitted request error', () => {
            const expectedPath = '/path';
            const expectedQueryString = {};
            const expectedErrorType = RequestError;
            const expectedErrorMessage = 'message';

            const nockInstance = nock('http://127.0.0.1')
                .get(expectedPath)
                .query(_.cloneDeep(expectedQueryString))
                .replyWithError(expectedErrorMessage);

            return getRequest('http://127.0.0.1/path', {})
                .catch(error => {
                    nockInstance.done();
                    assert.instanceOf(error, expectedErrorType);
                    // nock prepends "Error happened" to error message
                    assert.equal(error.message, `Error happened: ${expectedErrorMessage}`);
                });
        });
    });

    describe('delay tests, withput nock', () => {
        /*
         * due to https://github.com/node-nock/nock/issues/754
         * it's not possible to test delays with nock, so we must use
         * our own implementation
         */

        const serverTimeout = 200;
        let serverPort;
        let server;

        before((done) => {
            getPort()
                .then(availablePort => {
                    serverPort = availablePort;
                    server = http.createServer();
                    server.on('request', (request, response) => {
                        response.setHeader('Content-Type', 'application/json');
                        response.statusCode = 200;
                        setTimeout(() => {
                            response.write(JSON.stringify({data: null}));
                            response.end();
                        }, serverTimeout);
                    });
                    server.listen(availablePort, done);
                });
        });

        after((done) => {
            server.close(done);
        });

        it('request with timeout wasnt reached', function () {
            this.slow(serverTimeout * 3);

            const timeoutMsec = serverTimeout + Math.round(serverTimeout / 2);
            const expectedResponse = {data: null};

            return getRequest(`http://127.0.0.1:${serverPort}/path`, undefined, timeoutMsec)
                .then(response => {
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with timeout reached', function () {
            this.slow(serverTimeout * 3);

            const timeoutMsec = serverTimeout - Math.round(serverTimeout / 2);

            return getRequest(`http://127.0.0.1:${serverPort}/path`, undefined, timeoutMsec)
                .catch(error => {
                    assert.instanceOf(error, RequestError);
                    assert.equal(error.message, 'Error happened: ESOCKETTIMEDOUT');
                });
        });
    });
});
