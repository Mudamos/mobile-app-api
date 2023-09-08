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

describe('Profile documents update', function () {
    it('Should update profile documents', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);
        let cpf = chance.cpf().replace(/\.|\-/g, '');
        let voteidcard = generateVoteIdCard();
        let termsAccepted = true;
        let response = http('POST', `${PROFILE_PATH}/documents`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    cpf,
                    voteidcard,
                    termsAccepted
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.getBody('utf8'));

        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.user.profile_email).to.be.equal(userCreationRequest.user.email);
        expect(responseBody.data.user.user_name).to.be.equal(userCreationRequest.user.name);
        expect(responseBody.data.user.user_voteidcard).to.be.equal(voteidcard);
        expect(responseBody.data.user.user_cpf).to.be.equal(cpf);
    });

    it('Should fail to update profile documents if cpf is given with ponctuation', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        let voteidcard = generateVoteIdCard();

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);
        let cpf = chance.cpf();
        let response = http('POST', `${PROFILE_PATH}/documents`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    cpf,
                    voteidcard
                }
            },
            timeout: 200
        });

        var responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update profile if token provided is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        let voteidcard = generateVoteIdCard();

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/documents`, {
            headers: {
                "Authorization": `Bearer null`
            },
            json: {
                user: {
                    'documents': {
                        'cpf': chance.cpf().replace(/\.|\-/g, ''),
                        'voteidcard': voteidcard
                    }
                }
            },
            timeout: 200
        });

        expect(response.body.toString()).to.be.equal("Unauthorized");
    });

    it('Should fail to update profile if cpf is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/documents`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'documents': {
                        'cpf': '4444444444444'
                    }
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update profile if voteidcard is invalid', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/documents`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'documents': {
                        'voteidcard': '4444444444444'
                    }
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to update profile if documents is null', function () {
        this.timeout(5000);
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        let response = http('POST', `${PROFILE_PATH}/documents`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: {
                user: {
                    'documents': null
                }
            },
            timeout: 200
        });

        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
    });
});

function generateVoteIdCard() {
    let numero = [];

    for (i = 0; i <= 7; i++) {
        numero[i] = Math.floor(Math.random() * 9);
    }

    numero[9] = Math.floor(Math.random() * 2);
    numero[10] = Math.floor(Math.random() * 8);

    let firstSum = ((numero[0] * 2) +
        (numero[1] * 3) +
        (numero[2] * 4) +
        (numero[3] * 5) +
        (numero[4] * 6) +
        (numero[5] * 7) +
        (numero[6] * 8) +
        (numero[7] * 9));
    let firstPart = Math.floor(firstSum / 11);
    let secondPart = (firstPart * 11);
    let firstDigit = (firstSum - secondPart);
    if (firstDigit > 9) firstDigit = 0;
    let soma2 = ((numero[9] * 7) +
        (numero[10] * 8) +
        (firstDigit * 9));
    parte3 = Math.floor(soma2 / 11);
    parte4 = (parte3 * 11);
    dig2 = (soma2 - parte4);
    if (dig2 > 9) dig2 = 0;

    return `${numero.join('')}${firstDigit}${dig2}`;
}