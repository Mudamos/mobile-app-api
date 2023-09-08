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

describe('Mobile pin generation', function () {
    it('Should generate a pin', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 });
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/mobile_pin`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: { "mobile": { "number": randomNumber.toString() } },
            timeout: 2000
        });

        return getMobilePin(randomNumber).then(msg => {
            expect(msg).to.have.property('pinCode');
        });
    });

    it('Should fail to generate a pin if mobile number is invalid', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        const randomNumber = chance.integer({ min: 11111, max: 999999 });
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/mobile_pin`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: { "mobile": { "number": randomNumber.toString() } },
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to generate a pin if mobile number is null', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        const randomNumber = chance.integer({ min: 11111, max: 999999 });
        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/mobile_pin`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: { "mobile": { "number": randomNumber.toString() } },
            timeout: 2000
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to generate a pin if user token is null', function () {
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 });

        let response = http('POST', `${PROFILE_PATH}/mobile_pin`, {
            headers: {
                "Authorization": `Bearer null`
            },
            json: { "mobile": { "number": randomNumber.toString() } },
            timeout: 2000
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });

    it('Should fail to generate a pin if Authorization header is missing', function () {
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 });

        let response = http('POST', `${PROFILE_PATH}/mobile_pin`, {
            json: { "mobile": { "number": randomNumber.toString() } },
            timeout: 2000
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });
});


function getMobilePin(mobileNumber) {
    let client = require('redis').createClient({ 'password': 'originalmy' });
    return new Promise(function (resolve, reject) {
        client.get(mobileNumber, (err, res) => {
            err ? reject(err) : resolve(JSON.parse(res));
        })
    });
}