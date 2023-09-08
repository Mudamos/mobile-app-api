let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v1';
const PROFILE_PATH = `${BASE_PATH}/users/profile`;
let apiClient = new ApiClient(BASE_PATH);
let bitcoin = require('bitcoinjs-lib');

describe('Update profile info', function () {
    it('Should update profile info', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let request = {
            "user": {
                "birthday": `${chance.integer({ min: 1990, max: 1995 })}-${chance.integer({ min: 10, max: 12 })}-${chance.integer({ min: 10, max: 20 })}`,
                "name": chance.name(),
                "zipcode": chance.integer({ min: 11111111, max: 99999999 }).toString(),
                'district': chance.word({ length: 5 }),
                'state': chance.word({ length: 5 }),
                'uf': chance.word({ length: 2 }),
                'city': chance.word({ length: 5 }),
                'lat':-23.532934,
                'lng':-46.72902190000001
            }
        };
        
        let response = http('POST', `${PROFILE_PATH}/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: request,
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal('success');
        expect(responseBody.data.user.user_name).to.be.equal(request.user.name);
        expect(responseBody.data.user.user_zipcode).to.be.equal(request.user.zipcode);
        expect(responseBody.data.user.user_birthday).to.be.equal(request.user.birthday);
        expect(responseBody.data.user.user_state).to.not.be.null;
        expect(responseBody.data.user.user_uf).to.not.be.null;
        expect(responseBody.data.user.user_city).to.not.be.null;

    });

    it('Should fail to update profile if name is invalid', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let request = {
            "user": {
                "birthday": `${chance.integer({ min: 1990, max: 1995 })}-${chance.integer({ min: 10, max: 12 })}-${chance.integer({ min: 10, max: 20 })}`,
                "name": '',
                "zipcode": chance.integer({ min: 11111111, max: 99999999 }).toString()
            }
        };
        let response = http('POST', `${PROFILE_PATH}/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: request,
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal('fail');
    });

  it('Should fail to update profile if birthday is invalid', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let request = {
            "user": {
                "birthday": `${chance.integer({ min: 1990, max: 1995 })}-${chance.integer({ min: 90, max: 90 })}-${chance.integer({ min: 10, max: 20 })}`,
                "name": chance.name(),
                "zipcode": chance.integer({ min: 11111111, max: 99999999 }).toString()
            }
        };
        let response = http('POST', `${PROFILE_PATH}/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: request,
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal('fail');
    });
  
  it('Should fail to update profile if user have less than 16 years', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let request = {
            "user": {
                "birthday": `${chance.integer({ min: 2005, max: 2006 })}-${chance.integer({ min: 10, max: 12 })}-${chance.integer({ min: 10, max: 20 })}`,
                "name": chance.name(),
                "zipcode": chance.integer({ min: 11111111, max: 99999999 }).toString()
            }
        };
        let response = http('POST', `${PROFILE_PATH}/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: request,
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal('fail');
    });

  it('Should fail to update profile if zipcode is invalid', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let request = {
            "user": {
                "birthday": `${chance.integer({ min: 1990, max: 1995 })}-${chance.integer({ min: 10, max: 12 })}-${chance.integer({ min: 10, max: 20 })}`,
                "name": chance.name(),
                "zipcode": chance.integer({ min: 111111111, max: 999999999 }).toString()
            }
        };
        let response = http('POST', `${PROFILE_PATH}/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: request,
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal('fail');
    });
});