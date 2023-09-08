let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v1';
const PROFILE_PATH = `${BASE_PATH}/users`;
let apiClient = new ApiClient(BASE_PATH);
let bitcoin = require('bitcoinjs-lib');

describe('Reset password', function () {
    it('Should user reset password', function () {
      let request = UserFixture.RESET_REMOVE;

        let response = http('POST', `${PROFILE_PATH}/password/reset`, {
            json: request,
            timeout: 2000
        });
        
        let responseBody = JSON.parse(response.body.toString());
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal('success');

    });

    
});