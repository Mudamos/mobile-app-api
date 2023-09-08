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
describe('Profile access', function () {
    it('Should access current user profile', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('GET', PROFILE_PATH, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.profile_email).to.be.equal(userCreationRequest.user.email);
        expect(responseBody.data.user.user_name).to.be.equal(userCreationRequest.user.name);
    });

    it('Should return unauthorized if the token is empty', function () {
        let response = http('GET', PROFILE_PATH, {
            headers: {
                "Authorization": `Bearer `
            }
        });

        expect(response.statusCode).to.be.equal(401);
        expect(response.body.toString()).to.be.equal('Unauthorized');
    });

    it('Should return unauthorized if the token is null', function () {
        let response = http('GET', PROFILE_PATH, {
            headers: {
                "Authorization": `Bearer null`
            }
        });

        expect(response.statusCode).to.be.equal(401);
        expect(response.body.toString()).to.be.equal('Unauthorized');
    });

    it('Should return unauthorized if Authorization token is missing', function () {
        let response = http('GET', PROFILE_PATH);

        expect(response.statusCode).to.be.equal(401);
        expect(response.body.toString()).to.be.equal('Unauthorized');
    });
});