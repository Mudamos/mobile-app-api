let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
const BASE_PATH = 'http://localhost:4000/api/v1';
const PETITION_PATH = `${BASE_PATH}/petition`;
let apiClient = new ApiClient(BASE_PATH);
let bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');

describe('Petition info', function () {
    it('Should get petition info using plip id', function () {
        let userCreationRequest = UserFixture.VALID;

        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateVote(token).then(vote => {
            let response = http('GET', `${PETITION_PATH}/plip/${vote.petition.id_petition}/info`);

            let responseBody = JSON.parse(response.getBody('utf8'));
            expect(response.statusCode).to.be.equal(200);
            expect(responseBody.status).to.be.equal("success");
            expect(responseBody.data.info.blockchainaddress).to.be.a('string');
            expect(responseBody.data.info.updatedAt).to.be.a('string');
            expect(responseBody.data.info.signaturesCount).to.be.equal(1);
        });
    });
});