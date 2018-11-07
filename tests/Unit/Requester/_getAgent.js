const {assert} = require('chai');

const {Agent: HttpAgent} = require('http');
const {Agent: HttpsAgent} = require('https');

const Requester = require('src/Requester');

describe('Unit: _getAgent', () => {

    it('get HTTP Agent', function () {
        const url = 'http://myhost.com';
        const requester = new Requester();
        const agent = requester._getAgent(url);

        assert.deepEqual(agent, requester._httpAgent);
        assert.instanceOf(requester._httpAgent, HttpAgent);
        assert.strictEqual(requester._httpsAgent, null);
    });

    it('get HTTPS Agent', function () {
        const url = 'https://myhost.com';
        const requester = new Requester();
        const agent = requester._getAgent(url);

        assert.deepEqual(agent, requester._httpsAgent);
        assert.instanceOf(requester._httpsAgent, HttpsAgent);
        assert.strictEqual(requester._httpAgent, null);
    });

    it('agents are created only once and then are reused', function () {
        const httpUrl1 = 'http://myhost1.com';
        const httpUrl2 = 'http://myhost2.com';
        const httpsUrl1 = 'https://myhost3.com';
        const httpsUrl2 = 'https://myhost4.com';
        const requester = new Requester();
        const httpAgent1 = requester._getAgent(httpUrl1);
        const httpAgent2 = requester._getAgent(httpUrl2);
        const httpsAgent1 = requester._getAgent(httpsUrl1);
        const httpsAgent2 = requester._getAgent(httpsUrl2);

        assert.deepEqual(httpAgent1, requester._httpAgent);
        assert.deepEqual(httpAgent2, requester._httpAgent);
        assert.deepEqual(httpAgent1, httpAgent2);
        assert.instanceOf(requester._httpAgent, HttpAgent);
        assert.deepEqual(httpsAgent1, requester._httpsAgent);
        assert.deepEqual(httpsAgent2, requester._httpsAgent);
        assert.deepEqual(httpsAgent1, httpsAgent2);
        assert.instanceOf(requester._httpsAgent, HttpsAgent);
    });
});
