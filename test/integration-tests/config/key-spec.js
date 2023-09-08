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
const CONFIG_PATH = `${BASE_PATH}/config`;
let apiClient = new ApiClient(BASE_PATH);

describe('Config endpoint', function () {
    it('Should find a config key', function () {
        let userRequest = UserFixture.VALID;
        apiClient.createUser(userRequest);
        let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);

        const configKey = 'difficulty';

        let response = http('GET', `${CONFIG_PATH}/${configKey}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data).to.not.be.null;
        expect(responseBody.data.config).to.not.be.null;
        expect(responseBody.data.config.key).to.be.a('string');
        expect(responseBody.data.config.value).to.be.a('string');
        expect(responseBody.data.config.value).to.be.eq('3');
        expect(response.statusCode).to.be.equal(200);
    });

        it('Should fail to find a invalid config key', function () {
        let userRequest = UserFixture.VALID;
        apiClient.createUser(userRequest);
        let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);

        const configKey = 'batata';

        let response = http('GET', `${CONFIG_PATH}/${configKey}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    /*it('Should fail to find a config key without bearer token', function () {
        const configKey = 'difficulty';

        let response = http('GET', `${CONFIG_PATH}/${configKey}`);
        expect(response.statusCode).to.be.equal(401);
    });*/
});
