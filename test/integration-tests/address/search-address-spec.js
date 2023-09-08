let LibCrypto = require('mudamos-libcrypto')
let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
require('dotenv').load({ silent: true });
let nconf = require('nconf');
nconf.overrides({
    'DB_HOST': 'localhost'
});

const BASE_PATH = 'http://localhost:4000/api/v1';
const ADDRESS_PATH = `${BASE_PATH}/address`;
let apiClient = new ApiClient(BASE_PATH);

describe('Address endpoint', function () {
    it('Should find an address by zipcode', function () {
        let userRequest = UserFixture.VALID;
        apiClient.createUser(userRequest);
        let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
        const zipcode = '07159610';

        let response = http('GET', `${ADDRESS_PATH}/search/${zipcode}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let responseBody = JSON.parse(response.body.toString());

        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data).to.not.be.null;
        expect(responseBody.data.address).to.be.a('string');
        expect(responseBody.data.zipcode).to.be.a('string');
        expect(responseBody.data.district).to.be.a('string');
        expect(responseBody.data.state).to.be.a('string');
        expect(responseBody.data.uf).to.be.a('string');
        expect(responseBody.data.city).to.be.a('string');
        expect(responseBody.data.lat).to.be.a('number');
        expect(responseBody.data.lng).to.be.a('number');
        expect(response.statusCode).to.be.equal(200);
    });

    it('Should return unauthorized for an request without bearer token', function () {
        let userRequest = UserFixture.VALID;
        apiClient.createUser(userRequest);
        let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
        const zipcode = '07159610';

        let response = http('GET', `${ADDRESS_PATH}/search/${zipcode}`);
        expect(response.statusCode).to.be.equal(401);
    });

    it('Should fail to find an address with invalid by zipcode', function () {
        let userRequest = UserFixture.VALID;
        apiClient.createUser(userRequest);
        let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);

        const zipcode = '--------';

        let response = http('GET', `${ADDRESS_PATH}/search/${zipcode}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
        expect(response.statusCode).to.be.equal(200);
    });
});
