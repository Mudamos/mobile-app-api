let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v2';
const PROFILE_PATH = `${BASE_PATH}/users`;
let apiClient = new ApiClient(BASE_PATH);
let bitcoin = require('bitcoinjs-lib');
let LibCrypto = require('mudamos-libcrypto');
const crypto = require('crypto');

describe('Reset password v2', function () {
    it('Should user reset password', function () {
      let request = UserFixture.RESET_REMOVE;

       let tokenSha = crypto.createHash('sha256').update(`${request.user.email}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block })
        
        let response = http('POST', `${PROFILE_PATH}/password/reset`, {
            json: request,
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal('success');

    });
});