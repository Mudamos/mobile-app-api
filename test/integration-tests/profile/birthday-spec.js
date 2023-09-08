let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v1';
const PROFILE_PATH = `${BASE_PATH}/profile`;
let apiClient = new ApiClient(BASE_PATH);
let bitcoin = require('bitcoinjs-lib');

describe('Profile birthday update', function () {
    it('Should update profile birthday', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/birthday`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'birthday': '1991-08-06'
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.profile_email).to.be.equal(userCreationRequest.user.email);
        expect(responseBody.data.user.user_name).to.be.equal(userCreationRequest.user.name);
        expect(responseBody.data.user.user_birthday).to.be.equal('1991-08-06');
    });

    it('Should fail to update profile if token provided is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/birthday`, {
            headers: {
                "Authorization": `Bearer null`
            },
            json: {
                user: {
                    'birthday': '1991-08-06'
                }
            },
            timeout: 200
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });


    it('Should fail to update profile if birthday is invalid date', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/birthday`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'birthday': '1991-25-06'
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update profile if birthday is empty', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/birthday`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'birthday': ''
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update profile if birthday is null', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/birthday`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'birthday': null
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });
});
