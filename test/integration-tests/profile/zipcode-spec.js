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

describe('Profile zipcode update', function () {
    it('Should update profile zipcode', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);
        let user = {
                    zipcode: chance.integer({ min: 11111111, max: 99999999 }).toString(),
                    'district': chance.word({ length: 5 }),
                    'state': chance.word({ length: 5 }),
                    'uf': chance.word({ length: 2 }),
                    'city': chance.word({ length: 5 }),
                    'lat': -23.532934,
                    'lng': -46.72902190000001
                };
        let response = http('POST', `${PROFILE_PATH}/zipcode`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.user_state).to.be.equal(user.state);
        expect(responseBody.data.user.user_uf).to.be.equal(user.uf);
        expect(responseBody.data.user.user_city).to.be.equal(user.city);
        expect(responseBody.data.user.user_district).to.be.equal(user.district);        
        expect(responseBody.data.user.profile_email).to.be.equal(userCreationRequest.user.email);
        expect(responseBody.data.user.user_name).to.be.equal(userCreationRequest.user.name);
        expect(responseBody.data.user.user_zipcode).to.be.equal(user.zipcode);
    });

    it('Should fail to update profile if token provided is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/zipcode`, {
            headers: {
                "Authorization": `Bearer null`
            },
            json: {
                user: {
                    'zipcode': '1991-08-06'
                }
            },
            timeout: 200
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });


    it('Should fail to update profile if zipcode is invalid date', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/zipcode`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'zipcode': '1991-25-06'
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update profile if zipcode is empty', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/zipcode`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'zipcode': ''
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update profile if zipcode is null', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/zipcode`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'zipcode': null
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });
});

