let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');

const BASE_PATH = 'http://localhost:4000/api/v1';
const SIGNUP_PATH = `${BASE_PATH}/users/sign_up`;
const postOptions = { json: true };

describe('User Account creation', function () {
    it('Should create a user', function () {
        this.timeout(5000);
        let request = UserFixture.VALID;
        let response = http('POST', SIGNUP_PATH, {
            json: request
        });

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.profile_email).to.be.equal(request.user.email);
        expect(responseBody.data.user.user_name).to.be.equal(request.user.name);
    });

    it('Should fail to create a user if email is empty', function () {
        let response = http('POST', SIGNUP_PATH, { json: UserFixture.EMPTY_EMAIL });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if email is invalid', function () {
        let response = http('POST', SIGNUP_PATH, { json: UserFixture.INVALID_EMAIL });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if email is null', function () {
        let response = http('POST', SIGNUP_PATH, { json: UserFixture.NULL_EMAIL });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if name is empty', function () {
        let response = http('POST', SIGNUP_PATH, { json: UserFixture.EMPTY_NAME });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if name is null', function () {
        let response = http('POST', SIGNUP_PATH, { json: UserFixture.NULL_NAME });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if password is empty', function () {
        let response = http('POST', SIGNUP_PATH, { json: UserFixture.EMPTY_PASSWORD });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if password is null', function () {
        let response = http('POST', SIGNUP_PATH, { json: UserFixture.NULL_PASSWORD });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })
});

//Uncomment when validation rules are implemented
//frisby.create('Should fail to create a user if name is invalid')
//    .post(SIGNUP_PATH, UserFixture.INVALID_NAME, postOptions)
//    .expectJSON({
//        "status": "fail"
//}).toss();

//Uncomment when validation rules are implemented
//frisby.create('Should fail to create a user if password is invalid')
//    .post(SIGNUP_PATH, UserFixture.INVALID_PASSWORD, postOptions)
//    .expectJSON({
//        "status": "fail"
//}).toss();