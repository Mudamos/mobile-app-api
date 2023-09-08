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
const nconf = require('nconf');
const BlockchainModel = require('../../../app_v1/models/blockchain/blockchain');


describe('Digest status', function () {
    it('Should get a digest status', function () {
        let petitionSha = registerPetition();
        let response = http('GET', `${PETITION_PATH}/${petitionSha}/status`);
        let responseBody = JSON.parse(response.getBody('utf8'));
        //Pode ocorrer erro caso a quota do Staging da OriginalMy esteja zerada
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.blockchain.status).to.be.equal("pending");
        expect(responseBody.data.blockchain.success).to.be.equal(true);
    });

    it('Should fail if petition dont exists', function () {
        let petitionSha = registerPetition();
        
        let response = http('GET', `${PETITION_PATH}/banana/status`);
        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("fail");
    });
});

function registerPetition() {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': chance.integer({ min: 1111111, max: 9999999 }),
                'sha': hash,
                'url': chance.url(),
                'page_url': chance.url()
            }
        };

        let response = http('POST', `${PETITION_PATH}/register`, {
            json: request,
            headers: {
                "Authorization": "ABC1234"
            }
        });
        return hash;
}