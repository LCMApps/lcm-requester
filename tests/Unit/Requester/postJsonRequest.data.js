module.exports = {
    invalidParamsType: [() => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    }),

    invalidTimeoutType: [true, '123', ['a', 'b'], () => {}, Symbol()].map((type) => {
        return {type: Object.prototype.toString.call(type), value: type};
    }),

    validArgs: [
        {
            descr: 'with null and positive int timeout',
            params: null,
            timeout: 1234,
        },
        {
            descr: 'empty object params and positive int timeout',
            params: {},
            timeout: 1234,
        },
        {
            descr: 'true as params and positive int timeout',
            params: true,
            timeout: 1234,
        },
        {
            descr: 'false as params and positive int timeout',
            params: false,
            timeout: 1234,
        },
        {
            descr: 'empty string as params and positive int timeout',
            params: '',
            timeout: 1234,
        },
        {
            descr: 'array as params and positive int timeout',
            params: [1, 2],
            timeout: 1234,
        },
        {
            descr: 'object as params and positive int timeout',
            params: {streamName: 'abcd'},
            timeout: 1234,
        },
        {
            descr: 'object as params and no timeout',
            params: {streamName: 'abcd'},
            timeout: undefined,
        }
    ],
};
