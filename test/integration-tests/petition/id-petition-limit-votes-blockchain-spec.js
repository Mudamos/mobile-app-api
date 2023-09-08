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

describe('Petition signatures blockchain', function () {
    it('Should get petition signatures', function () {
        const magicPetitionId = 7517251;
        let response = http('GET', `${PETITION_PATH}/${magicPetitionId}/signatures`);

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.signatures).to.be.a('array');
        expect(responseBody.data.signatures.length).to.be.equal(1);
        //expect(responseBody.data.signatures[0].petition_pdf_url).to.be.equal("https://s3-sa-east-1.amazonaws.com/assinaturas.mudamos.org/107/2017/04/15/1076617408127107072.pdf")
        expect(responseBody.data.signatures[0].petition_blockchain_transaction_id).to.be.equal("186cfcedba345e1931e2d0c0842ce468cd2939666f8513db81a5e62491e7fd58")
        expect(responseBody.data.signatures[0].petition_updatedat).to.be.equal("2017-05-06 17:43:28")
        expect(responseBody.data.signatures[0].petition_txstamp).to.be.equal("2018-01-01 00:00:00")
        expect(responseBody.data.signatures[0].petition_blockstamp).to.be.equal("2018-01-01 00:00:00")
        expect(responseBody.data.signatures[0].petition_signature).to.be.equal("186cfcedba345e1931e2d0c0842ce468cd2939666f8513db81a5e62491e7fd58")
    });
});
