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

describe('Petition register', function () {
    it('Should register a petition', function () {
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

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(response.statusCode).to.be.equal(200);
        expect(responseBody.status).to.be.equal("success");
        expect(responseBody.data.blockchain.IdVersion).to.be.equal(request.petition.id_version);
        expect(responseBody.data.blockchain.IdPetition).to.be.equal(request.petition.id_petition);
        expect(responseBody.data.blockchain.DigSig).to.be.equal(request.petition.sha);
        expect(responseBody.data.blockchain.Url).to.be.equal(request.petition.url);
    });

    it('Should fail to register a petition with invalid id_version', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': 'axasawqw',
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

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to register a petition with empty id_version', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': '',
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

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to register a petition with invalid id_petition', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': 'axasawqw',
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

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to register a petition with empty id_petition', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': '',
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

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to register a petition with invalid sha', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': chance.integer({ min: 1111111, max: 9999999 }),
                'sha': 'batata doce ///*',
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

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to register a petition with empty sha', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': chance.integer({ min: 1111111, max: 9999999 }),
                'sha': '',
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

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });


    it('Should fail to register a petition with invalid url', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': chance.integer({ min: 1111111, max: 9999999 }),
                'sha': hash,
                'url': 'batata doce ///*',
                'page_url': 'batata doce ///*'
            }
        };

        let response = http('POST', `${PETITION_PATH}/register`, {
            json: request,
            headers: {
                "Authorization": "ABC1234"
            }
        });

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });

    it('Should fail to register a petition with empty url', function () {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': chance.integer({ min: 1111111, max: 9999999 }),
                'sha': hash,
                'url': '',
                'page_url': ''
            }
        };

        let response = http('POST', `${PETITION_PATH}/register`, {
            json: request,
            headers: {
                "Authorization": "ABC1234"
            }
        });

        let responseBody = JSON.parse(response.getBody('utf8'));
        expect(responseBody.status).to.be.equal("fail");
    });
});