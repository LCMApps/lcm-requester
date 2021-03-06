module.exports = {
    invalidParamsType: [true, 123, ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    }),

    invalidTimeoutType: [true, '123', ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    }),

    validArgs: [
        {
            descr: 'without params and positive int timeout',
            params: undefined,
            body: {},
            timeout: 1234,
        },
        {
            descr: 'empty object params and positive int timeout',
            params: {},
            body: {},
            timeout: 1234,
        },
        {
            descr: 'params and positive int timeout',
            params: {streamName: 'abcd'},
            body: {},
            timeout: 1234,
        },
        {
            descr: 'params and no timeout',
            params: {streamName: 'abcd'},
            body: {},
            timeout: undefined,
        }
    ],
};
