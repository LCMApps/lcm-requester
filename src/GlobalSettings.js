'use strict';

class GlobalSettings {
    constructor() {
        this.timeoutMsec = 30000;
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
}

module.exports = GlobalSettings;
