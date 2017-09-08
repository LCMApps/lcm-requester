const {assert} = require('chai');
const dataDriven = require('data-driven');
const GlobalSettings = require('src/GlobalSettings');

describe('Unit: GlobalSettings', () => {
    let globalSettings;

    beforeEach(() => {
        globalSettings = new GlobalSettings();
    });

    it('default timeout', () => {
        const expectedDefaultTimeout = 30000;

        assert.equal(globalSettings.getTimeout(), expectedDefaultTimeout);
    });

    const invalidTypePayload = [null, true, '123', {}, ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidTypePayload, () => {
        it('timeoutMsec must be a positive int but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'timeoutMsec must be a positive integer';
            const expoectedTimeoutAfterCall = 30000;

            assert.throws(() => {
                globalSettings.setTimeout(ctx.value);
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getTimeout(), expoectedTimeoutAfterCall);
        });
    });

    const invalidValuePayload = [
        {type: 'negative int', value: -1},
        {type: 'not int but number', value: 1.2}
    ];

    dataDriven(invalidValuePayload, () => {
        it('timeoutMsec must be a positive int but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'timeoutMsec must be a positive integer';
            const expoectedTimeoutAfterCall = 30000;

            assert.throws(() => {
                globalSettings.setTimeout(ctx.value);
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getTimeout(), expoectedTimeoutAfterCall);
        });
    });

    it('set valid timeout', () => {
        const newTimeout = 1000;

        globalSettings.setTimeout(newTimeout);

        assert.equal(globalSettings.getTimeout(), newTimeout);
    });
});
