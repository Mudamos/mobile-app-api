let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');

const BASE_PATH = 'http://localhost:4000/api/v2';
const SIGNUP_PATH = `${BASE_PATH}/users/sign_up`;
let LibCrypto = require('mudamos-libcrypto');
const crypto = require('crypto');
const postOptions = { json: true };

describe('User Account creation v2', function () {
    it('Should create a user', function () {
        this.timeout(5000);
        let request = UserFixture.VALID;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block })
        
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
        let request = UserFixture.EMPTY_EMAIL;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block });
        let response = http('POST', SIGNUP_PATH, { json: request });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if email is invalid', function () {
        let request = UserFixture.INVALID_EMAIL;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block });
        let response = http('POST', SIGNUP_PATH, { json: request });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if email is null', function () {
        let request = UserFixture.NULL_EMAIL;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block });
        let response = http('POST', SIGNUP_PATH, { json: request });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if name is empty', function () {
        let request = UserFixture.EMPTY_NAME;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block });
        let response = http('POST', SIGNUP_PATH, { json: request });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if name is null', function () {
        let request = UserFixture.NULL_NAME;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block });
        let response = http('POST', SIGNUP_PATH, { json: request });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if password is empty', function () {
        let request = UserFixture.EMPTY_PASSWORD;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block });
        let response = http('POST', SIGNUP_PATH, { json: request });
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal('fail');
    })

    it('Should fail to create a user if password is null', function () {
        let request = UserFixture.NULL_PASSWORD;
        let tokenSha = crypto.createHash('sha256').update(`${request.user.name};${request.user.email};${request.user.password}`, 'utf8').digest('hex');
        let block = LibCrypto.mineMessage(tokenSha, 3 % 2);
        request = Object.assign(request, { block });
        let response = http('POST', SIGNUP_PATH, { json: request });
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