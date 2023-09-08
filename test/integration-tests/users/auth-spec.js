let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');

const BASE_PATH = 'http://localhost:4000/api/v1';
const SIGNUP_PATH = `${BASE_PATH}/users/sign_up`;
const SIGNIN_PATH = `${BASE_PATH}/auth/token`;
const LOGOUT_PATH = `${BASE_PATH}/auth/logout`;
const postOptions = { json: true };
let apiClient = new ApiClient(BASE_PATH);
describe('User login workflow', function () {
    it('Should login a user', function () {
        this.timeout(5000);
        let request = UserFixture.VALID;

        http('POST', SIGNUP_PATH, {
            json: request
        });

        let response = http('POST', SIGNIN_PATH, {
            "headers": {
                'Authorization': `Basic ${new Buffer(`${request.user.email}:${request.user.password}`).toString('base64')}`
            }
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.token_type).to.be.equal('Bearer');
        expect(responseBody.data.access_token).to.be.a('string');
    });

    it('Should fail if username dont exists', function () {

        let response = http('POST', SIGNIN_PATH, {
            "headers": {
                'Authorization': `Basic ${new Buffer(`${'batata'}:${'palha'}`).toString('base64')}`
            }
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(responseBody.status).to.be.equal("fail");
        expect(responseBody.data.errorCode).to.be.equal(1001);
        expect(responseBody.data.type).to.be.equal("authentication");
        expect(responseBody.data.message).to.be.equal("Usuário ou senha inválidos");
    });

    it('Should fail if password is wrong', function () {
        this.timeout(5000);

        let request = UserFixture.VALID;
        http('POST', SIGNUP_PATH, {
            json: request
        });

        let response = http('POST', SIGNIN_PATH, {
            "headers": {
                'Authorization': `Basic ${new Buffer(`${request.user.email}:${'salamaleico'}`).toString('base64')}`
            }
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(responseBody.status).to.be.equal("fail");
        expect(responseBody.data.errorCode).to.be.equal(1001);
        expect(responseBody.data.type).to.be.equal("authentication");
        expect(responseBody.data.message).to.be.equal("Usuário ou senha inválidos");
    });
});

describe('Logout workflow', function () {
    it('Should logout', function () {
        let request = UserFixture.VALID;
        apiClient.createUser(request);
        let token = apiClient.generateToken(request.user.email, request.user.password);
        
        let response = http('POST', LOGOUT_PATH, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        expect(response.statusCode).to.be.equal(200);
        let responseBody = JSON.parse(response.body.toString());
    
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.logout).to.be.equal(true);
    });

    it('Should fail to logout if user dont exists', function () {
        let response = http('POST', LOGOUT_PATH, {
            headers: {
                "Authorization": `Bearer asaskaljsashasjla`
            }
        });
        
        expect(response.statusCode).to.be.equal(401);
    });
});