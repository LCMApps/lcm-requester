const _ = require('lodash');
const nock = require('nock');
const http = require('http');
const getPort = require('get-port');
const {assert} = require('chai');
const dataDriven = require('data-driven');

const Requester = require('src/Requester');
const {RequestError} = require('src/Error/index');

describe('Functional: Requester::postJsonRequest', () => {
    describe('nock based', () => {
        const requester = new Requester();

        before(() => {
            nock.cleanAll();
            nock.disableNetConnect();
        });

        after(() => {
            nock.enableNetConnect();
            nock.cleanAll();
        });

        afterEach(function () {
            nock.cleanAll();
        });

        const dataDrivenPayload = ['', null, true, false, 12, 12.34, [1, 2, 3], {}, {arg1: 'val1'}].map((value) => {
            return {type: Object.prototype.toString.call(value), value: value, expectedBody: JSON.stringify(value)};
        });

        dataDriven(_.cloneDeep(dataDrivenPayload), () => {
            it('params must be a serializable value, but {type} was passed', ctx => {
                const expectedPath = '/path';
                const requestJson = ctx.value;
                const expectedBody = ctx.expectedBody;
                const expectedResponse = {data: {value: 321}};

                const nockInstance = nock('http://127.0.0.1')
                    .post(expectedPath, expectedBody)
                    .reply(200, _.cloneDeep(expectedResponse), {
                        'Content-Type': 'application/json'
                    });

                return requester.postJsonRequest('http://127.0.0.1/path', requestJson)
                    .then(response => {
                        nockInstance.done();
                        assert.property(response, 'response');
                        assert.property(response, 'responseBody');
                        assert.deepEqual(response.responseBody, expectedResponse);
                    });
            });
        });

        it('request with qs in uri and params', () => {
            const expectedPath = '/path?arg1=val1';
            const requestJson = {arg2: 'val2'};
            const expectedBody = JSON.stringify(requestJson);
            const expectedResponse = {data: {value: 321}};

            const nockInstance = nock('http://127.0.0.1')
                .post(expectedPath, expectedBody)
                .reply(200, _.cloneDeep(expectedResponse));

            return requester.postJsonRequest('http://127.0.0.1/path?arg1=val1', requestJson)
                .then(response => {
                    nockInstance.done();
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with 400 response', () => {
            const expectedPath = '/path';
            const requestJson = {arg1: 'val1'};
            const expectedBody = JSON.stringify(requestJson);
            const expectedResponse = {error: {code: 1, message: 'some message'}};

            const nockInstance = nock('http://127.0.0.1')
                .post(expectedPath, expectedBody)
                .reply(400, _.cloneDeep(expectedResponse));

            return requester.postJsonRequest('http://127.0.0.1/path', requestJson)
                .then(response => {
                    nockInstance.done();
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with emitted request error', () => {
            const expectedPath = '/path';
            const requestJson = {arg1: 'val1'};
            const expectedBody = JSON.stringify(requestJson);
            const expectedErrorType = RequestError;
            const expectedErrorMessage = 'message';

            const nockInstance = nock('http://127.0.0.1')
                .post(expectedPath, expectedBody)
                .replyWithError(expectedErrorMessage);

            return requester.postJsonRequest('http://127.0.0.1/path', requestJson)
                .catch(error => {
                    nockInstance.done();
                    assert.instanceOf(error, expectedErrorType);
                    // nock prepends "Error happened" to error message
                    assert.equal(error.message, `Error happened: ${expectedErrorMessage}`);
                });
        });
    });

    describe('delay tests, without nock', () => {
        /*
         * due to https://github.com/node-nock/nock/issues/754
         * it's not possible to test delays with nock, so we must use
         * our own implementation
         */

        const requester = new Requester();
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

            return requester.postJsonRequest(`http://127.0.0.1:${serverPort}/path`, {}, timeoutMsec)
                .then(response => {
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                });
        });

        it('request with timeout reached', function () {
            this.slow(serverTimeout * 3);

            const timeoutMsec = serverTimeout - Math.round(serverTimeout / 2);

            return requester.postJsonRequest(`http://127.0.0.1:${serverPort}/path`, {}, timeoutMsec)
                .catch(error => {
                    assert.instanceOf(error, RequestError);
                    assert.equal(error.message, 'Error happened: ESOCKETTIMEDOUT');
                });
        });
    });

    describe('keep-alive connection', () => {
        let requester;
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
                        response.write(JSON.stringify({data: null}));
                        response.end();
                    });
                    server.listen(availablePort, done);
                });
        });

        afterEach(() => {
            requester._httpAgent.destroy();
        });

        after((done) => {
            server.close(done);
        });

        it('request without keep-alive connection', function () {
            const expectedResponse = {data: null};
            const expectedConnectionHeader = 'close';
            const expectedAgentFreeSockets = 0;

            requester = new Requester({
                agentOptions: {
                    keepAlive: false
                }
            });

            return requester.postJsonRequest(`http://127.0.0.1:${serverPort}/path`, {})
                .then(response => {
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                    assert.strictEqual(response.response.headers.connection, expectedConnectionHeader);
                    assert.lengthOf(Object.keys(requester._httpAgent.freeSockets), expectedAgentFreeSockets);
                });
        });

        it('request with keep-alive connection', function () {
            const expectedResponse = {data: null};
            const expectedConnectionHeader = 'keep-alive';
            const expectedAgentFreeSockets = 1;

            requester = new Requester({
                agentOptions: {
                    keepAlive: true
                }
            });

            return requester.postJsonRequest(`http://127.0.0.1:${serverPort}/path`, {})
                .then(response => {
                    assert.property(response, 'response');
                    assert.property(response, 'responseBody');
                    assert.deepEqual(response.responseBody, expectedResponse);
                    assert.strictEqual(response.response.headers.connection, expectedConnectionHeader);
                    assert.lengthOf(Object.keys(requester._httpAgent.freeSockets), expectedAgentFreeSockets);
                });
        });
    });
});
