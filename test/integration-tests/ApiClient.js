let http = require('sync-request');
const crypto = require('crypto');
let chance = new require('chance')();
let expect = require('chai').expect;
let LibCrypto = require('mudamos-libcrypto');
let UserFixture = require('../fixtures/User');
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

let Connection = require('../../config/initializers/database');
const BASE_PATH = 'http://localhost:4000/api/v1';
const MESSAGE_PATH = `${BASE_PATH}/message`;
let bitcoin = require('bitcoinjs-lib');
let Promise = require('bluebird');
let ProfileFixture = require('../fixtures/Profile');
let DocumentsFixture = require('../fixtures/Documents');

module.exports = class {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    generateVote() {
        const txId = crypto.createHmac('sha256', 'potato')
            .update(chance.url({ length: 5 }))
            .digest('hex');
        let userRequest = UserFixture.VALID;
        this.createUser(userRequest);

        let token = this.generateToken(userRequest.user.email, userRequest.user.password);

        let seedCreate = LibCrypto.createSeedAndWallet('BRAZILIAN-PORTUGUESE', 'ExtraEntropy');
        let petition = this.generatePetition();
        const documents = DocumentsFixture.VALID;
        const profile = ProfileFixture.VALID;

        let message = `${profile.user.name};${profile.user.zipcode};${documents.user.voteidcard};${new Date().toISOString()};bla;${petition.id_version}`;
        let result = LibCrypto.signMessage(seedCreate.seed, message, 3);

        this.createWallet(token, result.split(';')[6]);
        this.updateProfile(token, profile);
        this.updateDocuments(token, documents);

        return this.createMobileInfo(token).then(() => {
            return new Promise(function (resolve, reject) {
                var connection = new Connection();
                connection.getPool().getConnection(function (err, connection) {
                    connection.query('UPDATE petition SET Status = 1, BlockStamp = NOW(), TxId = ? WHERE IdVersion = ?', [txId, petition.id_version], function (error, rows, fields) {
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

                        resolve({
                            profile,
                            petition,
                            user: userRequest.user,
                            vote: JSON.parse(response.body.toString())
                        });
                    })
                });
            });
        });
    }

    confirmPetition(id_version) {
        const txId = crypto.createHmac('sha256', 'potato')
            .update(chance.url({ length: 5 }))
            .digest('hex');

        return new Promise(function (resolve, reject) {
            var connection = new Connection();
            connection.getPool().getConnection(function (err, connection) {
                connection.query('UPDATE petition SET Status = 1, BlockStamp = NOW(), TxId = ? WHERE IdVersion = ?', [txId, id_version], function (error, rows, fields) {
                    connection.release();
                    if(err) { reject(err); return; }
                    resolve();
                })
            });
        });
    }

    createUser(request) {
        return http('POST', `${this.baseURL}/users/sign_up`, {
            json: request
        });
    }

    generateToken(username, password) {
        let response = http('POST', `${this.baseURL}/auth/token`, {
            "headers": {
                'Authorization': `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`
            }
        });
        return JSON.parse(response.getBody('utf8')).data.access_token;
    }

    getProfile(accessToken) {
        let response = http('GET', `${this.baseURL}/profile`, {
            "headers": {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return JSON.parse(response.getBody('utf8')).data.user;
    }

    generateMobilePin(acessToken, phoneNumber) {
        let response = http('POST', `${this.baseURL}/profile/mobile_pin`, {
            headers: {
                "Authorization": `Bearer ${acessToken}`
            },
            json: { "mobile": { "number": phoneNumber.toString() } },
            timeout: 2000
        });

        return this.getMobilePin(phoneNumber);
    }

    getMobilePin(mobileNumber) {
        let client = require('redis').createClient({ 'password': 'originalmy' });
        return new Promise(function (resolve, reject) {
            client.get(mobileNumber, (err, res) => {
                err ? reject(err) : resolve(JSON.parse(res).pinCode);
            })
        });
    }

    generatePetition(idPetition) {
        const secret = 'potato';
        const hash = crypto.createHmac('sha256', secret)
            .update(chance.url({ length: 5 }))
            .digest('hex');

        let request = {
            petition: {
                'id_version': chance.integer({ min: 1111111, max: 9999999 }),
                'id_petition': idPetition || chance.integer({ min: 1111111, max: 9999999 }),
                'sha': hash,
                'url': chance.url(),
                'page_url': chance.url(),
                'name': chance.name()
            }
        };

        let response = http('POST', `${this.baseURL}/petition/register`, {
            headers: {
                "Authorization": `ABC1234`
            },
            json: request
        });
        return request.petition;
    }

    updateProfile(token, profile) {
        let response = http('POST', `${this.baseURL}/users/profile/update`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: profile,
            timeout: 1000
        });

        return profile.user;
    }

    updateDocuments(token, documents) {
        let response = http('POST', `${this.baseURL}/profile/documents`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            json: documents,
            timeout: 1000
        });

        return documents.user;
    }

    createWallet(accessToken, wallet) {
        let bitcoin = require('bitcoinjs-lib');
        var keyPair = bitcoin.ECPair.makeRandom();
        let response = http('POST', `${this.baseURL}/profile/wallet`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            json: {
                user: {
                    'walletKey': wallet || keyPair.getAddress()
                }
            },
            timeout: 200
        });
    }

    createMobileInfo(accessToken) {
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
        const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

        return this.generateMobilePin(accessToken, randomNumber).then(pin => {
            let request = {
                "mobile": {
                    "pinCode": pin,
                    "number": randomNumber,
                    "imei": randomIMEI,
                    "brand": chance.word(),
                    "model": chance.syllable(),
                    "so": chance.word(),
                    "soVersion": `${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}`,
                    "screenSize": `${chance.integer({ min: 100, max: 400 })}x${chance.integer({ min: 100, max: 400 })}`
                }
            };
            let response = http('POST', `${this.baseURL}/profile/mobile`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                json: request,
                timeout: 2000
            });
        });
    }
}
