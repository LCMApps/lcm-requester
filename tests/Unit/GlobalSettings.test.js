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

    const invalidTimeoutTypePayload = [null, true, '123', {}, ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidTimeoutTypePayload, () => {
        it('timeoutMsec must be a positive int but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'timeoutMsec must be a positive integer';
            const expectedTimeoutAfterCall = 30000;

            assert.throws(() => {
                globalSettings.setTimeout(ctx.value);
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getTimeout(), expectedTimeoutAfterCall);
        });
    });

    const invalidTimeoutValuePayload = [
        {type: 'negative int', value: -1},
        {type: 'not int but number', value: 1.2}
    ];

    dataDriven(invalidTimeoutValuePayload, () => {
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

    it('default timing', () => {
        const expectedDefaultTiming = false;

        assert.equal(globalSettings.getTiming(), expectedDefaultTiming);
    });

    const invalidTimingTypePayload = [null, 123, '123', {}, ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidTimingTypePayload, () => {
        it('timing must be a boolean but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'timing must be a boolean';
            const expectedTimingAfterCall = false;

            assert.throws(() => {
                globalSettings.setTiming(ctx.value);
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getTiming(), expectedTimingAfterCall);
        });
    });

    it('set valid timing', () => {
        const newTiming = true;

        globalSettings.setTiming(newTiming);

        assert.equal(globalSettings.getTiming(), newTiming);
    });

    it('default agentOptions', () => {
        const expectedDefaultAgentOptions = undefined;

        assert.equal(globalSettings.getAgentOptions(), expectedDefaultAgentOptions);
    });

    const invalidAgentOptionsTypePayload = [null, true, 123, '123', ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidAgentOptionsTypePayload, () => {
        it('agentOptions must be a plain object but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'agentOptions must be a plain object';
            const expectedAgentOptionsAfterCall = undefined;

            assert.throws(() => {
                globalSettings.setAgentOptions(ctx.value);
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getAgentOptions(), expectedAgentOptionsAfterCall);
        });
    });


    const invalidKeepAliveOptionsTypePayload = [null, 123, '123', ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidKeepAliveOptionsTypePayload, () => {
        it('agentOptions.keepAlive options must be a boolean but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'agentOptions.keepAlive must be a boolean';
            const expectedAgentOptionsAfterCall = undefined;

            assert.throws(() => {
                globalSettings.setAgentOptions({keepAlive: ctx.value});
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getAgentOptions(), expectedAgentOptionsAfterCall);
        });
    });

    const invalidKeepAliveMsecsTypePayload = [null, true, '123', {}, ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidKeepAliveMsecsTypePayload, () => {
        it('agentOptions.keepAliveMsecs must be a positive int but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'agentOptions.keepAliveMsecs must be a positive integer';
            const expectedAgentOptionsAfterCall = undefined;

            assert.throws(() => {
                globalSettings.setAgentOptions({keepAliveMsecs: ctx.value});
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getAgentOptions(), expectedAgentOptionsAfterCall);
        });
    });

    const invalidKeepAliveMsecsOptionsValuePayload = [
        {type: 'negative int', value: -1},
        {type: 'float', value: 1.2}
    ];

    dataDriven(invalidKeepAliveMsecsOptionsValuePayload, () => {
        it('agentOptions.keepAliveMsecs must be a positive int but {type} was passed', ctx => {
            const expectedErrorType = TypeError;
            const expectedErrorMessage = 'agentOptions.keepAliveMsecs must be a positive integer';
            const expectedAgentOptionsAfterCall = undefined;

            assert.throws(() => {
                globalSettings.setAgentOptions({keepAliveMsecs: ctx.value});
            }, expectedErrorType, expectedErrorMessage);

            assert.equal(globalSettings.getAgentOptions(), expectedAgentOptionsAfterCall);
        });
    });

    it('set valid agentOptions', () => {
        const newAgentOptions = {
            keepAlive: true,
            keepAliveMsecs: 100
        };

        globalSettings.setAgentOptions(newAgentOptions);

        assert.equal(globalSettings.getAgentOptions(), newAgentOptions);
    });
});
