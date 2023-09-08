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

describe('User email update', function () {
    it('Should update email update', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        let userUpdate =  UserFixture.UPDATE_EMAIL;
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: userUpdate.user
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.profile_email).to.be.equal(userUpdate.user.profile_email);
    });

     it('Should fail to update user email if email is equal actual', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'profile_email': userCreationRequest.user.email
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update email if token provided is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        let userUpdate =  UserFixture.UPDATE_EMAIL;
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `Bearer null`
            },
            json: {
                user: userUpdate.user
            },
            timeout: 200
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });

    it('Should fail to update user email is invalid email', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                     'profile_email': 'teseteste'
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update user email if email is empty', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'profile_email': ''
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

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
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


    it('Should update email update authorization root key', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        let userUpdate =  UserFixture.UPDATE_EMAIL;
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `ABC1234`
            },
            json: {
                user: {
                    'profile_email': userCreationRequest.user.email,
                    'new_profile_email': userUpdate.user.profile_email
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.profile_email).to.be.equal(userUpdate.user.profile_email);
        expect(responseBody.data.user.profile_email).to.not.equal(userCreationRequest.user.email);  
    });

    it('Should fail to update user email if email not exists', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/email/update`, {
            headers: {
                "Authorization": `ABC1234`
            },
            json: {
                user: {
                    'profile_email': 'teste@orginalmy.com'
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });
});
