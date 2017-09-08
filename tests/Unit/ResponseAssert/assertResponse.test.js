const _ = require('lodash');
const sinon = require('sinon');
const dataDriven = require('data-driven');
const {assert} = require('chai');

const testData = require('tests/Unit/ResponseAssert/assertResponse.data');

const {InvalidResponseFormatError} = require('src/Error');

const proxyquire = require('proxyquire');

const InvalidResponseFormatErrorStub = sinon.stub();
InvalidResponseFormatErrorStub.callsFake((...args) => {
    return new InvalidResponseFormatError(...args);
});

const {assertResponse} = proxyquire('src/ResponseAssert', {
    'src/Error': {
        InvalidResponseFormatError: InvalidResponseFormatErrorStub
    }
});

describe('Unit: ResponseAssert::assertResponse', () => {
    afterEach(() => {
        InvalidResponseFormatErrorStub.resetHistory();
    });

    dataDriven(_.cloneDeep(testData.invalidResponseFormat), () => {
        it('{descr}', (ctx) => {
            const response = {response: ctx.response, responseBody: ctx.responseBody};
            const expectedResponseInErrorConstructor = _.cloneDeep(response);

            assert.throws(() => {
                assertResponse(response);
            }, InvalidResponseFormatError, ctx.expectedErrorMessage);

            assert.isTrue(InvalidResponseFormatErrorStub.calledOnce);

            const responsePassedToErrorConstructor = InvalidResponseFormatErrorStub.firstCall.args[1];
            assert.deepEqual(expectedResponseInErrorConstructor, responsePassedToErrorConstructor);
        });
    });

    dataDriven(_.cloneDeep(testData.validResponseFormat), () => {
        it('{descr}', (ctx) => {
            const response = {response: ctx.response, responseBody: ctx.responseBody};

            assert.doesNotThrow(() => {
                assertResponse(response);
            });
        });
    });
});
