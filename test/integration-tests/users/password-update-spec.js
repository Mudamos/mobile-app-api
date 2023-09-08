let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v1';
const PASSWORD_UPDATE_PATH = `${BASE_PATH}/users/password/update/`;
let apiClient = new ApiClient(BASE_PATH);
let bitcoin = require('bitcoinjs-lib');

describe('Change password', function () {
    it('Should change password', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);
        let request = {
               "user":{
                   "currentPassword": userCreationRequest.user.password,
                   "newPassword":  chance.word({ syllables: 3 }) + chance.integer()
               }
            };
        
        let response = http('POST', PASSWORD_UPDATE_PATH, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: request
        });

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('success');

        let authResponse = http('POST', `${BASE_PATH}/auth/token`, {
            "headers": {
                'Authorization': `Basic ${new Buffer(`${userCreationRequest.user.email}:${request.user.newPassword}`).toString('base64')}`
            }
        });

        let authResponseBody = JSON.parse(authResponse.body.toString());
        
        expect(authResponse.statusCode).to.be.equal(200);
        expect(authResponseBody.status).to.be.equal("success");
        expect(authResponseBody.data.token_type).to.be.equal('Bearer');
        expect(authResponseBody.data.access_token).to.be.a('string');
    });
   
   it('Should fail to change password if password is invalid/empty', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);
        let request = {
               "user":{
                   "email": userCreationRequest.user.email,
                   "password": ''
               }
            };
        
        let response = http('POST', PASSWORD_UPDATE_PATH, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: request
        });

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    });

   it('Should fail to change password if token is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let request = {
               "user":{
                   "email": userCreationRequest.user.email,
                   "password": ''
               }
            };
        let response = http('POST', PASSWORD_UPDATE_PATH, {
            headers: {
                "Authorization": `Bearer`
            },
            json: request
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });
});