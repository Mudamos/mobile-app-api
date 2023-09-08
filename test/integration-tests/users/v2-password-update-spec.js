let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v2';
const V1_BASE_PATH = 'http://localhost:4000/api/v1';
const PASSWORD_UPDATE_PATH = `${BASE_PATH}/users/password/update/`;
let apiClient = new ApiClient(BASE_PATH);
let v1ApiClient = new ApiClient(V1_BASE_PATH);
let bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');
let LibCrypto = require('mudamos-libcrypto');
describe('Change password v2', function () {
    it('Should change password', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        let res = v1ApiClient.createUser(userCreationRequest);
        const newPassword = chance.word({ syllables: 3 }) + chance.integer();

        return generateTokenPin(userCreationRequest.user.email).then(pincode => {
            let tokenSha = crypto.createHash('sha256').update(`${newPassword};${pincode}`, 'utf8').digest('hex');
            let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
            let response = http('POST', PASSWORD_UPDATE_PATH, {
                json: { user: { password: newPassword, pincode }, block }
            });

            let responseBody = JSON.parse(response.getBody('utf8'));

            let authResponse = http('POST', `${V1_BASE_PATH}/auth/token`, {
                "headers": {
                    'Authorization': `Basic ${new Buffer(`${userCreationRequest.user.email}:${newPassword}`).toString('base64')}`
                }
            });

            let authResponseBody = JSON.parse(authResponse.body.toString());

            expect(authResponse.statusCode).to.be.equal(200);
            expect(authResponseBody.status).to.be.equal("success");
            expect(authResponseBody.data.token_type).to.be.equal('Bearer');
            expect(authResponseBody.data.access_token).to.be.a('string');
        });
    });

    it('Should fail to change password if password is invalid/empty v2', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        let res = v1ApiClient.createUser(userCreationRequest);
        const newPassword = '';

        return generateTokenPin(userCreationRequest.user.email).then(pincode => {
            let tokenSha = crypto.createHash('sha256').update(`${newPassword};${pincode}`, 'utf8').digest('hex');
            let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
            let response = http('POST', PASSWORD_UPDATE_PATH, {
                json: { user: { password: newPassword, pincode }, block }
            });

            let responseBody = JSON.parse(response.getBody('utf8'));
            expect(responseBody.status).to.be.equal('fail');
        });
    });
});

function generateTokenPin(email) {
    let client = require('redis').createClient({ 'password': 'originalmy' });
    return new Promise(function (resolve, reject) {
        var pinCode = chance.integer({ min: 11111, max: 99999 });
        client.set(pinCode, JSON.stringify({ email: email, pinCode }), (err, res) => {
            err ? reject(err) : resolve(pinCode.toString());
        });
    });
}