# lcm-requester - is a wrapper on request module with validation on top of format and rules used

[![NPM version](https://img.shields.io/npm/v/lcm-requester.svg)](https://www.npmjs.com/package/lcm-requester)
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

# Super simple to use

```js
const requester = require('lcm-requester');

const response = await requester.getRequest('https://google.com/path?arg1=val1');
```
