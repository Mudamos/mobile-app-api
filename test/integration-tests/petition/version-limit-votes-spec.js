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

describe('Petition votes', function () {
    it('Should get petition votes using version id', function () {
        let userCreationRequest = UserFixture.VALID;

        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateVote(token).then(vote => {
            let response = http('GET', `${PETITION_PATH}/${vote.petition.id_version}/50/votes`);

            let responseBody = JSON.parse(response.getBody('utf8'));
            expect(response.statusCode).to.be.equal(200);
            expect(responseBody.status).to.be.equal("success");
            expect(responseBody.data.votes).to.be.a('array');
            expect(responseBody.data.votes.length).to.be.equal(1);

            expect(responseBody.data.votes[0].profile_email).to.be.equal(vote.user.email);
            expect(responseBody.data.votes[0].profile_id).to.not.be.null;
            expect(responseBody.data.votes[0].profile_picture).to.not.be.null;
            expect(responseBody.data.votes[0].profile_type).to.not.be.null;
            expect(responseBody.data.votes[0].user_city).to.be.equal(vote.profile.user.city);
            expect(responseBody.data.votes[0].user_name).to.be.equal(vote.profile.user.name);
            expect(responseBody.data.votes[0].user_state).to.be.equal(vote.profile.user.state);
            expect(responseBody.data.votes[0].user_uf).to.be.equal(vote.profile.user.uf);
            expect(responseBody.data.votes[0].vote_date).to.not.be.null;
        });
    });
});
