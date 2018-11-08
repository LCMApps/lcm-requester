const _ = require('lodash');
const {assert} = require('chai');
const dataDriven = require('data-driven');

const Requester = require('src/Requester');

describe('Unit: constructor', () => {

    it('config === undefined', function () {
        const expectedDefaultTimeout = 30000;
        const requester = new Requester();

        assert.strictEqual(requester.getTimeout(), expectedDefaultTimeout);
        assert.strictEqual(requester.getTiming(), false);
        assert.deepEqual(requester.getAgentOptions(), {});
        assert.deepEqual(requester.getAgentOptions(), {});
        assert.strictEqual(requester._httpAgent, null);
        assert.strictEqual(requester._httpsAgent, null);
    });

    it('valid empty config', function () {
        const expectedDefaultTimeout = 30000;
        const requester = new Requester({});

        assert.strictEqual(requester.getTimeout(), expectedDefaultTimeout);
        assert.strictEqual(requester.getTiming(), false);
        assert.deepEqual(requester.getAgentOptions(), {});
        assert.strictEqual(requester._httpAgent, null);
        assert.strictEqual(requester._httpsAgent, null);
    });

    it('valid full config', function () {
        const config = {
            timeoutMsecs: 1000,
            timing: true,
            agentOptions: {
                keepAlive: true,
                keepAliveMsecs: 500,
                maxSockets: Infinity,
                maxFreeSockets: 200,
                timeout: 2000,
            }
        };

        const requester = new Requester(_.cloneDeep(config));

        assert.strictEqual(requester.getTimeout(), config.timeoutMsecs);
        assert.strictEqual(requester.getTiming(), config.timing);
        assert.deepEqual(requester.getAgentOptions(), config.agentOptions);
        assert.strictEqual(requester._httpAgent, null);
        assert.strictEqual(requester._httpsAgent, null);
    });

    const invalidConfigTypePayload = [null, true, '123', ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidConfigTypePayload, function () {
        it('incorrect type of config, type = {type}', function (arg) {
            assert.throws(
                function () {
                    new Requester(arg.value);
                },
                TypeError,
                'config must be a plain object'
            );
        });
    });

    const invalidTimeoutMsecsTypePayload = [null, true, '123', {}, ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidTimeoutMsecsTypePayload, function () {
        it('incorrect type of config.timeoutMsecs, type = {type}', function (arg) {
            assert.throws(
                function () {
                    new Requester({timeoutMsecs: arg.value});
                },
                TypeError,
                'config.timeoutMsecs must be a positive integer'
            );
        });
    });

    const invalidTimeoutMsecsValuePayload = [
        {value: 0},
        {value: -1},
        {value: 1.2},
        {value: Infinity}
    ];

    dataDriven(invalidTimeoutMsecsValuePayload, function () {
        it('incorrect value of config.timeoutMsecs, value = {value}', function (arg) {
            assert.throws(
                function () {
                    new Requester({timeoutMsecs: arg.value});
                },
                TypeError,
                'config.timeoutMsecs must be a positive integer'
            );
        });
    });

    const invalidTimingTypePayload = [null, 12, '123', {}, ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidTimingTypePayload, function () {
        it('incorrect type of config.timing, type = {type}', function (arg) {
            assert.throws(
                function () {
                    new Requester({timing: arg.value});
                },
                TypeError,
                'config.timing must be a boolean'
            );
        });
    });

    const invalidAgentOptionsTypePayload = [null, true, '123', ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    });

    dataDriven(invalidAgentOptionsTypePayload, function () {
        it('incorrect type of config, type = {type}', function (arg) {
            assert.throws(
                function () {
                    new Requester({agentOptions: arg.value});
                },
                TypeError,
                'config.agentOptions must be a plain object'
            );
        });
    });
});
