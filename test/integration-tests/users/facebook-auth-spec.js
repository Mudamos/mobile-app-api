let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v1';
const FACEBOOK_AUTH_PATH = `${BASE_PATH}/auth/facebook/token`;
let apiClient = new ApiClient(BASE_PATH);
let UserFixture = require('../../fixtures/User');

describe('Facebook token workflow', function () {
    it('Should create an account using facebook token', function (done) {
        this.timeout(10000);

        let token = generateFacebookAccessToken();
        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `access_token=${token}`
        });

        let responseBody = JSON.parse(response.body.toString());
  
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.token_type).to.be.equal("Bearer");
        expect(responseBody.data.access_token).to.be.a('string');

        let profile = apiClient.getProfile(responseBody.data.access_token);
        let user = getFacebookData(token);
        expect(profile.profile_type).to.be.equal('facebook');
        expect(profile.profile_email).to.be.equal(user.email);
        expect(profile.user_name).to.be.equal(user.name);
        expect(profile.profile_id).to.be.equal(user.id);
        done();
    });

    it('Should return facebook token even if facebook account creation is used more than once', function (done) {
        this.timeout(10000);

        let token = generateFacebookAccessToken();
        http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `access_token=${token}`
        });
              
        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `access_token=${token}`
        });

        let responseBody = JSON.parse(response.body.toString());

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.token_type).to.be.equal("Bearer");
        expect(responseBody.data.access_token).to.be.a('string');

        let profile = apiClient.getProfile(responseBody.data.access_token);
        let user = getFacebookData(token);
        expect(profile.profile_type).to.be.equal('facebook');
        expect(profile.profile_email).to.be.equal(user.email);
        expect(profile.user_name).to.be.equal(user.name);
        expect(profile.profile_id).to.be.equal(user.id);
        done();
    });

    it('Should login even if user already exists with same email', function (done) {
        this.timeout(20000);
        let userCreationRequest = UserFixture.VALID;
        let token = generateFacebookAccessToken();
        let user = getFacebookData(token);
        userCreationRequest.user.email = user.email;
        apiClient.createUser(userCreationRequest);

        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `access_token=${token}`,
            timeout: 20000
        });


        let responseBody = JSON.parse(response.body.toString());
       
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.token_type).to.be.equal("Bearer");
        expect(responseBody.data.access_token).to.be.a('string');

        let profile = apiClient.getProfile(responseBody.data.access_token);

        expect(profile.profile_type).to.be.equal('facebook');
        expect(profile.profile_email).to.be.equal(userCreationRequest.user.email);
        expect(profile.user_name).to.be.equal(userCreationRequest.user.name);
        expect(profile.profile_id).to.be.equal(user.id);
        done();
    });

    it('Should fail to create an account if user is logged with facebook', function (done) {
        this.timeout(10000);
        let userCreationRequest = UserFixture.VALID;
        let token = generateFacebookAccessToken();
        let user = getFacebookData(token);
        userCreationRequest.user.email = user.email;

        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `access_token=${token}`,
            timeout: 1000
        });

        let failingResponse = JSON.parse(apiClient.createUser(userCreationRequest).body.toString());
  
        expect(failingResponse.status).to.be.equal("fail");
    });

    it('Should fail if facebook token is invalid', function () {
        this.timeout(10000);

        let token = generateFacebookAccessToken();
        let response = http('POST', FACEBOOK_AUTH_PATH, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `access_token=asasas`
        });

        expect(response.statusCode).to.be.equal(404);
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