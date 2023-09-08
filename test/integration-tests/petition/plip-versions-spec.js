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

describe('Petition versions', function () {
    it('Should get petition versions using plip id', function () {
        let userCreationRequest = UserFixture.VALID;

        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateVote(token).then(vote => {
            let response = http('GET', `${PETITION_PATH}/plip/${vote.petition.id_petition}/versions`);

            let responseBody = JSON.parse(response.getBody('utf8'));
            expect(response.statusCode).to.be.equal(200);
            expect(responseBody.status).to.be.equal("success");
            expect(responseBody.data.versions).to.be.a('array');
            expect(responseBody.data.versions.length).to.be.equal(1);
            expect(responseBody.data.versions[0].petition_blockstamp).to.not.be.null;
            expect(responseBody.data.versions[0].petition_blockstamp).to.not.be.null;
            expect(responseBody.data.versions[0].petition_name).to.be.equal(vote.petition.name);
            expect(responseBody.data.versions[0].petition_page_url).to.be.equal(vote.petition.page_url);
            expect(responseBody.data.versions[0].petition_pdf_url).to.be.equal(vote.petition.url);
            expect(responseBody.data.versions[0].petition_signature).to.not.be.null;
            expect(responseBody.data.versions[0].petition_updatedat).to.not.be.null;
            expect(responseBody.data.versions[0].petition_version).to.be.equal(vote.petition.id_version);
        });
    });

    it('Should get multiple versions using plip id', function () {
        let userCreationRequest = UserFixture.VALID;

        apiClient.createUser(userCreationRequest);

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateVote(token)
            .then(vote => {
                let updatedPetition = apiClient.generatePetition(vote.petition.id_petition);
                return apiClient.confirmPetition(updatedPetition.id_version).then(() => {
                    let response = http('GET', `${PETITION_PATH}/plip/${vote.petition.id_petition}/versions`);

                    let responseBody = JSON.parse(response.getBody('utf8'));
                    expect(response.statusCode).to.be.equal(200);
                    expect(responseBody.status).to.be.equal("success");
                    expect(responseBody.data.versions).to.be.a('array');
                    expect(responseBody.data.versions.length).to.be.equal(2);

                    let firstVersion = responseBody.data.versions.find(v => v.petition_version === vote.petition.id_version);
                    let secondVersion = responseBody.data.versions.find(v => v.petition_version === updatedPetition.id_version);

                    expect(firstVersion.petition_blockstamp).to.not.be.null;
                    expect(firstVersion.petition_blockstamp).to.not.be.null;
                    expect(firstVersion.petition_name).to.be.equal(vote.petition.name);
                    expect(firstVersion.petition_page_url).to.be.equal(vote.petition.page_url);
                    expect(firstVersion.petition_pdf_url).to.be.equal(vote.petition.url);
                    expect(firstVersion.petition_signature).to.not.be.null;
                    expect(firstVersion.petition_updatedat).to.not.be.null;
                    expect(firstVersion.petition_version).to.be.equal(vote.petition.id_version);

                    expect(secondVersion.petition_blockstamp).to.not.be.null;
                    expect(secondVersion.petition_name).to.be.equal(updatedPetition.name);
                    expect(secondVersion.petition_page_url).to.be.equal(updatedPetition.page_url);
                    expect(secondVersion.petition_pdf_url).to.be.equal(updatedPetition.url);
                    expect(secondVersion.petition_signature).to.not.be.null;
                    expect(secondVersion.petition_updatedat).to.not.be.null;
                    expect(secondVersion.petition_version).to.be.equal(updatedPetition.id_version);
                });
            });
    });
});
