const _ = require('lodash');
const sinon = require('sinon');
const dataDriven = require('data-driven');
const {assert} = require('chai');
const proxyquire = require('proxyquire').noCallThru();
const {lookup} = require('dns-lookup-cache');

const testData = require('tests/Unit/Requester/getRequests.data');
const {InvalidResponseFormatError} = require('src/Error');


describe('Unit: Requester::postFormUrlecodedRequest', () => {

    const requestStub = sinon.stub();
    const assertResponseStub = sinon.stub();
    const RequesterInitializer = proxyquire('src/Requester', {
        request: requestStub,
        './ResponseAssert': {
            assertResponse: assertResponseStub
        }
    });
    const requester = new RequesterInitializer();
    const getAgentSpy = sinon.spy(requester, '_getAgent');

    afterEach(() => {
        requestStub.reset();
        assertResponseStub.reset();
        getAgentSpy.resetHistory();
    });

    dataDriven(_.cloneDeep(testData.invalidParamsType), () => {
        it('params must be an object, but {type} was passed', ctx => {
            const expectedErrType = TypeError;
            const expectedErrMessage = 'params must be an object';

            return requester.getRequest('http://127.0.0.1/path', ctx.value)
                .then(() => {
                    assert.fail('called', 'must not be called');
                })
                .catch(err => {
                    assert.isFalse(requestStub.called);
                    assert.instanceOf(err, expectedErrType);
                    assert.strictEqual(err.message, expectedErrMessage);
                });
        });
    });

    dataDriven(_.cloneDeep(testData.invalidTimeoutType), () => {
        it('timeoutMsecs must be a positive int, but {type} was passed', ctx => {
            const expectedErrType = TypeError;
            const expectedErrMessage = 'timeoutMsecs must be a positive integer';

            return requester.getRequest('http://127.0.0.1/path', undefined, ctx.value)
                .then(() => {
                    assert.fail('called', 'must not be called');
                })
                .catch(err => {
                    assert.isFalse(requestStub.called);
                    assert.instanceOf(err, expectedErrType);
                    assert.strictEqual(err.message, expectedErrMessage);
                });
        });
    });

    it('timeoutMsecs must be a positive int, but negative int was passed', () => {
        const expectedErrType = TypeError;
        const expectedErrMessage = 'timeoutMsecs must be a positive integer';

        return requester.getRequest('http://127.0.0.1/path', undefined, -1)
            .then(() => {
                assert.fail('called', 'must not be called');
            })
            .catch(err => {
                assert.isFalse(requestStub.called);
                assert.instanceOf(err, expectedErrType);
                assert.strictEqual(err.message, expectedErrMessage);
            });
    });

    it('timeoutMsecs must be a positive int, but not int was passed', () => {
        const expectedErrType = TypeError;
        const expectedErrMessage = 'timeoutMsecs must be a positive integer';

        return requester.getRequest('http://127.0.0.1/path', undefined, 12.34)
            .then(() => {
                assert.fail('called', 'must not be called');
            })
            .catch(err => {
                assert.isFalse(requestStub.called);
                assert.instanceOf(err, expectedErrType);
                assert.strictEqual(err.message, expectedErrMessage);
            });
    });

    dataDriven(_.cloneDeep(testData.validArgs), () => {
        it('request {descr}', (ctx) => {
            const requestStubResponse = {
                statusCode: 200,
                request: {
                    href: 'http://127.0.0.1/path'
                },
            };

            const requestStubResponseBody = {
                data: {value: 321},
            };

            const expectedResponse = {
                response: _.cloneDeep(requestStubResponse),
                responseBody: _.cloneDeep(requestStubResponseBody)
            };

            const expectedTimeout = ctx.timeout ? ctx.timeout : 30000; // default timeout, must be hardcoded

            const expectedRequestStubOpts = {
                json: true,
                method: 'GET',
                timeout: expectedTimeout,
                url: 'http://127.0.0.1/path',
                agent: requester._getAgent('http://127.0.0.1/path'),
                family: 4,
                time: false
            };

            if (ctx.params && !_.isEmpty(ctx.params)) {
                expectedRequestStubOpts.qs = _.cloneDeep(ctx.params);
            }

            requester._getAgent.resetHistory();
            requestStub.callsArgWith(1, undefined, requestStubResponse, requestStubResponseBody);

            return requester.getRequest('http://127.0.0.1/path', ctx.params, ctx.timeout)
                .then(response => {
                    assert.isTrue(requestStub.calledOnce);
                    assert.containsAllKeys(requestStub.firstCall.args[0], expectedRequestStubOpts);
                    assert.isObject(response);
                    assert.deepEqual(response, expectedResponse);
                    assert.isTrue(assertResponseStub.calledOnce);
                    assert.isTrue(assertResponseStub.firstCall.calledWithExactly(expectedResponse));
                    assert.isTrue(getAgentSpy.calledOnce);
                    assert.isTrue(getAgentSpy.calledWithExactly('http://127.0.0.1/path'));
                    assert.isTrue(getAgentSpy.returned(requester._httpAgent));
                });
        });
    });

    it('request with HTTPS protocol', () => {
        const requestStubResponse = {
            statusCode: 200,
            request: {
                href: 'https://127.0.0.1/path'
            },
        };

        const requestStubResponseBody = {
            data: {value: 321},
        };

        const expectedResponse = {
            response: _.cloneDeep(requestStubResponse),
            responseBody: _.cloneDeep(requestStubResponseBody)
        };

        const expectedRequestStubOpts = {
            method: 'GET',
            timeout: 30000,
            url: 'https://127.0.0.1/path',
            json: true,
            lookup: lookup,
            family: 4,
            agent: requester._getAgent('https://127.0.0.1/path'),
            time: false
        };

        requester._getAgent.resetHistory();
        requestStub.callsArgWith(1, undefined, requestStubResponse, requestStubResponseBody);

        return requester.getRequest('https://127.0.0.1/path')
            .then(response => {
                assert.isTrue(requestStub.calledOnce);
                assert.deepEqual(requestStub.firstCall.args[0], expectedRequestStubOpts);
                assert.isObject(response);
                assert.deepEqual(response, expectedResponse);
                assert.isTrue(assertResponseStub.calledOnce);
                assert.isTrue(assertResponseStub.firstCall.calledWithExactly(expectedResponse));
                assert.isTrue(getAgentSpy.calledOnce);
                assert.isTrue(getAgentSpy.calledWithExactly('https://127.0.0.1/path'));
                assert.isTrue(getAgentSpy.returned(requester._httpsAgent));
            });
    });

    it('throws on failed assertResponse', () => {
        const requestStubResponse = {
            statusCode: 200,
            request: {
                href: 'http://127.0.0.1/path'
            },
        };

        const requestStubResponseBody = {
            data: {value: 321},
        };

        const expectedResponse = {
            response: _.cloneDeep(requestStubResponse),
            responseBody: _.cloneDeep(requestStubResponseBody)
        };

        const expectedAssertErr = new InvalidResponseFormatError('some message', expectedResponse);

        assertResponseStub.throws(expectedAssertErr);

        requestStub.callsArgWith(1, undefined, requestStubResponse, requestStubResponseBody);

        return requester.getRequest('http://127.0.0.1/path')
            .catch(error => {
                assert.isTrue(assertResponseStub.calledOnce);
                assert.isTrue(assertResponseStub.firstCall.calledWithExactly(expectedResponse));
                assert.instanceOf(error, InvalidResponseFormatError);
                assert.deepEqual(expectedAssertErr, error);
                assert.isTrue(getAgentSpy.calledOnce);
                assert.isTrue(getAgentSpy.calledWithExactly('http://127.0.0.1/path'));
                assert.isTrue(getAgentSpy.returned(requester._httpAgent));
            });
    });
});
