# lcm-requester - is a wrapper on request module with validation on top of format and rules used

[![NPM version](https://img.shields.io/npm/v/lcm-requester.svg)](https://www.npmjs.com/package/lcm-requester)
[![Release Status](https://github.com/LCMApps/lcm-requester/workflows/NPM%20Release/badge.svg)](https://github.com/LCMApps/lcm-requester/releases)
[![Build Status](https://travis-ci.org/LCMApps/lcm-requester.svg?branch=master)](https://travis-ci.org/LCMApps/lcm-requester)
[![Coverage Status](https://coveralls.io/repos/github/LCMApps/lcm-requester/badge.svg?branch=master)](https://coveralls.io/github/LCMApps/lcm-requester?branch=master)

# <a name="installation"></a>Installation

Using npm:
```shell
$ npm install --save lcm-requester
```

Using yarn:
```shell
$ yarn add lcm-requester
```

# Configuration
All available transports and configuration options listed below:
Parameter "agentOptions" support the same options like [HTTP Agent](https://nodejs.org/api/http.html#http_new_agent_options)
or [HTTPS Agent](https://nodejs.org/api/https.html#http_new_agent_options)

Example:
```json
{
    "requester": {
        "timeoutMsecs": 1000,
        "timing": true,
        "agentOptions": {
            "keepAlive": true,
            "keepAliveMsecs": 500,
            "maxSockets": 10000,
            "maxFreeSockets": 200,
            "timeout": 2000
        }
    }
}
```
# Super simple to use

```js
const {Requester} = require('lcm-requester');
```
```js
// Use default configuration
const requester = new Requester();
```
```js
// Use custom timeout on request with timing info
const requester = new Requester({
    timeoutMsecs: 2000,
    timing: true
});
```
```js
// Use custom HTTP Agent for requests
const requester = new Requester({
    timeoutMsecs: 2000,
    agentOptions: {
        keepAlive: true
    }
});
```

```js
const {response, responseBody} = await requester.getRequest('https://google.com/path?arg1=val1');
const {response, responseBody} = await requester.postFormUrlencodedRequest('https://google.com/path?arg1=val1');
const {response, responseBody} = await requester.postJsonRequest('https://google.com/path?arg1=val1', {});
const {response, responseBody} = await requester.deleteRequest('https://google.com/path?arg1=val1');
```
