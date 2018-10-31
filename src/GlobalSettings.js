'use strict';

const _ = require('lodash');

class GlobalSettings {
    constructor() {
        this.timeoutMsec = 30000;
        this.timing = false;
        this.agentOptions = undefined;
    }

    getTimeout() {
        return this.timeoutMsec;
    }

    setTimeout(timeoutMsec) {
        if (!Number.isSafeInteger(timeoutMsec) || timeoutMsec < 0) {
            throw new TypeError('timeoutMsec must be a positive integer');
        }

        this.timeoutMsec = timeoutMsec;
    }

    getTiming() {
        return this.timing;
    }

    setTiming(timing) {
        if (typeof timing !== 'boolean') {
            throw new TypeError('timing must be a boolean');
        }

        this.timing = timing;
    }

    getAgentOptions() {
        return this.agentOptions;
    }

    setAgentOptions(agentOptions) {
        if (!_.isPlainObject(agentOptions)) {
            throw new TypeError('agentOptions must be a plain object');
        }

        if ('keepAlive' in agentOptions && typeof agentOptions.keepAlive !== 'boolean') {
            throw new TypeError('agentOptions.keepAlive must be a boolean');
        }

        if ('keepAliveMsecs' in agentOptions
            && (!Number.isSafeInteger(agentOptions.keepAliveMsecs) || agentOptions.keepAliveMsecs < 0)
        ) {
            throw new TypeError('agentOptions.keepAliveMsecs must be a positive integer');
        }

        this.agentOptions = agentOptions;
    }
}

module.exports = GlobalSettings;
