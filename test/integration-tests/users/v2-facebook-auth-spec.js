let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v2';
const V1_BASE_PATH = 'http://localhost:4000/api/v1';

const FACEBOOK_AUTH_PATH = `${BASE_PATH}/auth/facebook/token`;
let apiClient = new ApiClient(BASE_PATH);
let v1ApiClient = new ApiClient(V1_BASE_PATH);
let UserFixture = require('../../fixtures/User');
const crypto = require('crypto');
let LibCrypto = require('mudamos-libcrypto');

describe('Facebook token workflow v2', function () {
    it('Should create an account using facebook token', function () {
        this.timeout(10000);

        let token = generateFacebookAccessToken();
        let tokenSha = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'access_token': token,
                'Content-Type': 'application/json'
            },
            json: { block }
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.token_type).to.be.equal("Bearer");
        expect(responseBody.data.access_token).to.be.a('string');

        let profile = v1ApiClient.getProfile(responseBody.data.access_token);
        let user = getFacebookData(token);
        expect(profile.profile_type).to.be.equal('facebook');
        expect(profile.profile_email).to.be.equal(user.email);
        expect(profile.user_name).to.be.equal(user.name);
        expect(profile.profile_id).to.be.equal(user.id);
    });

    it('Should fail to create an account with invalid block', function () {
        this.timeout(10000);

        let token = generateFacebookAccessToken();
        let tokenSha = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'access_token': token,
                'Content-Type': 'application/json'
            },
            json: { block: 'batata' }
        });

        expect(response.statusCode).to.be.equal(401);
    });

    it('Should fail to create an account using invalid access_token token', function () {
        this.timeout(10000);

        let token = generateFacebookAccessToken();
        let tokenSha = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'access_token': 'batata',
                'Content-Type': 'application/json'
            },
            json: { block }
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("error");
    });
});

function generateFacebookAccessToken() {
    let response = http('POST', 'https://graph.facebook.com/v3.2/807148079423775/accounts/test-users?access_token=1804378059818637%7Cfb8a8c3420f2052778d10e04dfaa4965',
        {
            body: 'installed=true&permissions=email'
        });

    return JSON.parse(response.body.toString()).access_token;
}

function getFacebookData(token) {
    let response = http('GET', `https://graph.facebook.com/v3.2/me?fields=id,name,email&access_token=${token}`);
    return JSON.parse(response.body.toString());
}