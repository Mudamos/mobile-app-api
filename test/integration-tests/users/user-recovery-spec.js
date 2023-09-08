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

describe('User profile recovery', function () {
    it('Should recovery profile by email if score is valid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
  
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/recovery`, {
            headers: {
                "Authorization": `ABC1234`
            },
            json: {
                user: {
                    user_name: userCreationRequest.user.name,
                    user_birthday: null,
                    user_voteidcard: null,
                    user_cpf: null,
                    user_zipcode: null,
                    user_state: null,
                    user_uf: null,
                    user_city: null,
                    user_district: null,
                    mobile_number: null,
                    profile_email: userCreationRequest.user.email
                }, score: 1
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.profile_email).to.be.equal(userCreationRequest.user.email);
    });

    it('Should recovery profile by email if score is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/recovery`, {
            headers: {
                "Authorization": `ABC1234`
            },
            json: {
                user: {
                    user_name: userCreationRequest.user.name,
                    user_birthday: null,
                    user_voteidcard: null,
                    user_cpf: null,
                    user_zipcode: null,
                    user_state: null,
                    user_uf: null,
                    user_city: null,
                    user_district: null,
                    mobile_number: null,
                    profile_email: userCreationRequest.user.email
                }, score: 3
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should recovery profile by email if score is email invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        let userUpdate =  UserFixture.UPDATE_EMAIL;
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/recovery`, {
            headers: {
                "Authorization": `ABC1234`
            },
            json: {
                user: {
                    user_name: userCreationRequest.user.name,
                    user_birthday: null,
                    user_voteidcard: null,
                    user_cpf: null,
                    user_zipcode: null,
                    user_state: null,
                    user_uf: null,
                    user_city: null,
                    user_district: null,
                    mobile_number: null,
                    profile_email: userUpdate.user.profile_email
                }, score: 1
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

      it('Should fail to user recovery if token provided is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `Bearer null`
            },
            json: {
                user: null
            },
            timeout: 200
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });
});
