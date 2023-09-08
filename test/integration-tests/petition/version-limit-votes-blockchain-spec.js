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

describe('Petition votes blockchain', function () {
    it('Should get petition votes that are already in blockchain', function () {
        const magicPetitionVersionId = 7052098;
        let response = http('GET', `${PETITION_PATH}/${magicPetitionVersionId}/50/votes/blockchain`);

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.votes).to.be.a('array');
        expect(responseBody.data.votes.length).to.be.equal(1);
        expect(responseBody.data.votes[0].vote_date).to.be.equal("2017-05-06 17:43:28");
        expect(responseBody.data.votes[0].user_name).to.be.equal("User");
        expect(responseBody.data.votes[0].user_city).to.be.equal("São Paulo");
        expect(responseBody.data.votes[0].user_state).to.be.equal("São Paulo");
        expect(responseBody.data.votes[0].user_uf).to.be.equal("SP");
        expect(responseBody.data.votes[0].profile_type).to.be.equal("app");
        expect(responseBody.data.votes[0].profile_id).to.be.equal("93");
        expect(responseBody.data.votes[0].profile_email).to.be.equal("gun@azote.gu");
        expect(responseBody.data.votes[0].profile_picture).to.be.equal("https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg");
    });
});
