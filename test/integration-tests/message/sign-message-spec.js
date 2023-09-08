let LibCrypto = require('mudamos-libcrypto');
let ApiClient = require('../ApiClient');
let mocha = require('mocha');
let http = require('sync-request');
let expect = require('chai').expect;
let UserFixture = require('../../fixtures/User');
let chance = new require('chance')();
let path = require('path')
require('dotenv').load({ silent: true });
let nconf = require('nconf');

nconf.overrides({
  'DB_HOST': 'localhost'
});

nconf
  .use('memory')
  .argv()
  .env();

let Connection = require('../../../config/initializers/database');
const BASE_PATH = 'http://localhost:4000/api/v1';
const MESSAGE_PATH = `${BASE_PATH}/message`;
let apiClient = new ApiClient(BASE_PATH);
let bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');
let Promise = require('bluebird');
let ProfileFixture = require('../../fixtures/Profile');
let DocumentsFixture = require('../../fixtures/Documents');

describe('Message sign workflow', function () {
  it('Should sign a message', function (done) {
    this.timeout(70000);
    let userRequest = UserFixture.VALID;
    apiClient.createUser(userRequest);

    let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);

    let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
    let petition = apiClient.generatePetition();
    const documents = DocumentsFixture.VALID;;
    const profile = ProfileFixture.VALID;

    let message = `${profile.user.name};${profile.user.zipcode};${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
    let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

    apiClient.createWallet(token, result.split(';')[6]);
    apiClient.updateProfile(token, profile);
    apiClient.updateDocuments(token, documents);
    apiClient.createMobileInfo(token).then(() => {

      var connection = new Connection();
      connection.getPool().getConnection(function (err, connection) {
        connection.query('UPDATE petition SET Status = 1 WHERE IdVersion = ?', [petition.id_version], function (error, rows, fields) {
          connection.release();
          let response = http('POST', `${MESSAGE_PATH}/sign`, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            json: {
              "signMessage": {
                petitionId: petition.id_version,
                block: result
              }
            }
          });
          let responseBody = JSON.parse(response.body.toString());
          expect(responseBody.status).to.be.equal("success");
          expect(response.statusCode).to.be.equal(200);
          done();
        })
      });
    });
  });

  it('Should fail to sign a message without Bearer token', function (done) {
    this.timeout(9000);
    let userRequest = UserFixture.VALID;
    apiClient.createUser(userRequest);

    let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
    let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
    let petition = apiClient.generatePetition();
    const documents = DocumentsFixture.VALID;;
    const profile = ProfileFixture.VALID;

    let message = `${profile.user.name};${profile.user.zipcode};${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
    let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

    apiClient.createWallet(token, result.split(';')[6]);
    apiClient.updateProfile(token, profile);
    apiClient.updateDocuments(token, documents);
    apiClient.createMobileInfo(token).then(() => {

      var connection = new Connection();
      connection.getPool().getConnection(function (err, connection) {
        connection.query('UPDATE petition SET Status = 1 WHERE IdVersion = ?', [petition.id_version], function (error, rows, fields) {
          connection.release();
          let response = http('POST', `${MESSAGE_PATH}/sign`, {
            json: {
              "signMessage": {
                petitionId: petition.id_version,
                block: result
              }
            }
          });
          expect(response.body.toString()).to.be.equal("Unauthorized");
          done();
        });
      });
    });
  });

  it('Should fail to sign a message when petition status is 0', function (done) {
    this.timeout(9000);
    let userRequest = UserFixture.VALID;
    apiClient.createUser(userRequest);

    let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
    let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
    let petition = apiClient.generatePetition();
    const documents = DocumentsFixture.VALID;;
    const profile = ProfileFixture.VALID;

    let message = `${profile.user.name};${profile.user.zipcode};${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
    let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

    apiClient.createWallet(token, result.split(';')[6]);
    apiClient.updateProfile(token, profile);
    apiClient.updateDocuments(token, documents);
    apiClient.createMobileInfo(token).then(() => {

      var connection = new Connection();
      connection.getPool().getConnection(function (err, connection) {
        connection.query('UPDATE petition SET Status = 0 WHERE IdVersion = ?', [petition.id_version], function (error, rows, fields) {
          connection.release();
          let response = http('POST', `${MESSAGE_PATH}/sign`, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            json: {
              "signMessage": {
                petitionId: petition.id_version,
                block: result
              }
            }
          });
          let responseBody = JSON.parse(response.body.toString());
          expect(responseBody.status).to.be.equal("fail");
          done();
        });
      });
    });
  });

  it('Should fail to sign a message when cep is invalid', function (done) {
    this.timeout(9000);
    let userRequest = UserFixture.VALID;
    apiClient.createUser(userRequest);

    let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
    let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
    let petition = apiClient.generatePetition();
    const documents = DocumentsFixture.VALID;;
    const profile = ProfileFixture.VALID;

    let message = `${profile.user.name};batata;${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
    let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

    apiClient.createWallet(token, result.split(';')[6]);
    apiClient.updateProfile(token, profile);
    apiClient.updateDocuments(token, documents);
    apiClient.createMobileInfo(token).then(() => {

      var connection = new Connection();
      connection.getPool().getConnection(function (err, connection) {
        connection.query('UPDATE petition SET Status = 1 WHERE IdVersion = ?', [petition.id_version], function (error, rows, fields) {
          connection.release();
          let response = http('POST', `${MESSAGE_PATH}/sign`, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            json: {
              "signMessage": {
                petitionId: petition.id_version,
                block: result
              }
            }
          });
          let responseBody = JSON.parse(response.body.toString());
          expect(responseBody.status).to.be.equal("fail");
          done();
        });
      });
    });
  });

  it('Should fail to sign a message when name is invalid', function (done) {
    this.timeout(9000);
    let userRequest = UserFixture.VALID;
    apiClient.createUser(userRequest);

    let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
    let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
    let petition = apiClient.generatePetition();
    const documents = DocumentsFixture.VALID;;
    const profile = ProfileFixture.VALID;

    let message = `;${profile.user.zipcode};${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
    let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

    apiClient.createWallet(token, result.split(';')[6]);
    apiClient.updateProfile(token, profile);
    apiClient.updateDocuments(token, documents);
    apiClient.createMobileInfo(token).then(() => {

      var connection = new Connection();
      connection.getPool().getConnection(function (err, connection) {
        connection.query('UPDATE petition SET Status = 1 WHERE IdVersion = ?', [petition.id_version], function (error, rows, fields) {
          connection.release();
          let response = http('POST', `${MESSAGE_PATH}/sign`, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            json: {
              "signMessage": {
                petitionId: petition.id_version,
                block: result
              }
            }
          });
          let responseBody = JSON.parse(response.body.toString());
          expect(responseBody.status).to.be.equal("fail");
          done();
        });
      });
    });
  });

  it('Should fail to sign a message when user dont have wallet', function (done) {
    this.timeout(9000);
    let userRequest = UserFixture.VALID;
    apiClient.createUser(userRequest);

    let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
    let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
    let petition = apiClient.generatePetition();
    const documents = DocumentsFixture.VALID;;
    const profile = ProfileFixture.VALID;

    let message = `${profile.user.name};${profile.user.zipcode};${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
    let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

    apiClient.updateProfile(token, profile);
    apiClient.updateDocuments(token, documents);
    apiClient.createMobileInfo(token).then(() => {


      var connection = new Connection();
      connection.getPool().getConnection(function (err, connection) {
        connection.query('UPDATE petition SET Status = 1 WHERE IdVersion = ?', [petition.id_version], function (error, rows, fields) {
          connection.release();
          let response = http('POST', `${MESSAGE_PATH}/sign`, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            json: {
              "signMessage": {
                petitionId: petition.id_version,
                block: result
              }
            }
          });
          let responseBody = JSON.parse(response.body.toString());
          expect(responseBody.status).to.be.equal("fail");
          done();
        });
      });
    });
  });

  it('Should fail to sign a message when user dont have mobile info', function (done) {
    this.timeout(90000000);
    let userRequest = UserFixture.VALID;
    apiClient.createUser(userRequest);

    let token = apiClient.generateToken(userRequest.user.email, userRequest.user.password);
    let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
    let petition = apiClient.generatePetition();
    const documents = DocumentsFixture.VALID;;
    const profile = ProfileFixture.VALID;

    let message = `${profile.user.name};${profile.user.zipcode};${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
    let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

    apiClient.createWallet(token, result.split(';')[6]);
    apiClient.updateProfile(token, profile);
    apiClient.updateDocuments(token, documents);

    var connection = new Connection();
    connection.getPool().getConnection(function (err, connection) {
      connection.query('UPDATE petition SET Status = 1 WHERE IdVersion = ?', [petition.id_version], function (error, rows, fields) {
        connection.release();
        let response = http('POST', `${MESSAGE_PATH}/sign`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            'batata': 'true'
          },
          json: {
            "signMessage": {
              petitionId: petition.id_version,
              block: result
            }
          }
        });
        let responseBody = JSON.parse(response.body.toString());
        expect(responseBody.status).to.be.equal("fail");
        done();
      });
    });
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
