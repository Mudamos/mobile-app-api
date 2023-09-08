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

describe('Update mobile info', function () {
    it('Should update mobile info', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
        const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateMobilePin(token, randomNumber).then(pin => {
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

            let response = http('POST', `${PROFILE_PATH}/mobile`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                json: request,
                timeout: 2000
            });

            let responseBody = JSON.parse(response.body.toString());
            expect(response.statusCode).to.be.equal(200);
            expect(responseBody.status).to.be.equal('success');
            expect(responseBody.data.user.mobile_number).to.be.equal(request.mobile.number);
            expect(responseBody.data.user.mobile_imei).to.be.equal(request.mobile.imei);
            expect(responseBody.data.user.mobile_brand).to.be.equal(request.mobile.brand);
            expect(responseBody.data.user.mobile_model).to.be.equal(request.mobile.model);
            expect(responseBody.data.user.mobile_so).to.be.equal(request.mobile.so);
            expect(responseBody.data.user.mobile_so_version).to.be.equal(request.mobile.soVersion);
            expect(responseBody.data.user.mobile_screensize).to.be.equal(request.mobile.screenSize);
        });
    });

    it('Should fail to update mobile info if token is missing', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
        const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateMobilePin(token, randomNumber).then(pin => {
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

            let response = http('POST', `${PROFILE_PATH}/mobile`, {
                headers: {
                    "Authorization": `Bearer `
                },
                json: request,
                timeout: 2000
            });

            expect(response.body.toString()).to.be.equal("Unauthorized");
        });
    });

        it('Should fail to update mobile info if Authorization header is missing', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
        const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateMobilePin(token, randomNumber).then(pin => {
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

            let response = http('POST', `${PROFILE_PATH}/mobile`, {
                json: request,
                timeout: 2000
            });

            expect(response.body.toString()).to.be.equal("Unauthorized");
        });
    });

    it('Should fail to update mobile info if phoneNumber is invalid', function () {
        let userCreationRequest = UserFixture.VALID;
        apiClient.createUser(userCreationRequest);
        const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
        const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

        let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

        return apiClient.generateMobilePin(token, randomNumber).then(pin => {
            let request = {
                "mobile": {
                    "pinCode": pin,
                    "number": chance.integer({ min: 11111, max: 99999 }).toString(),
                    "imei": randomIMEI,
                    "brand": chance.word(),
                    "model": chance.syllable(),
                    "so": chance.word(),
                    "soVersion": `${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}`,
                    "screenSize": `${chance.integer({ min: 100, max: 400 })}x${chance.integer({ min: 100, max: 400 })}`
                }
            };

            let response = http('POST', `${PROFILE_PATH}/mobile`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                json: request,
                timeout: 2000
            });

            let responseBody = JSON.parse(response.body.toString());
            expect(response.statusCode).to.be.equal(200);
            expect(responseBody.status).to.be.equal('fail');
        });
    });

//     it('Should fail to update mobile info if IMEI is invalid', function () {
//         let userCreationRequest = UserFixture.VALID;
//         apiClient.createUser(userCreationRequest);
//         const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
//         const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

//         let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

//         return apiClient.generateMobilePin(token, randomNumber).then(pin => {
//             let request = {
//                 "mobile": {
//                     "pinCode": pin,
//                     "number": randomNumber,
//                     "imei": '----***$$$%%%@@@',
//                     "brand": chance.word(),
//                     "model": chance.syllable(),
//                     "so": chance.word(),
//                     "soVersion": `${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}`,
//                     "screenSize": `${chance.integer({ min: 100, max: 400 })}x${chance.integer({ min: 100, max: 400 })}`
//                 }
//             };

//             let response = http('POST', `${PROFILE_PATH}/mobile`, {
//                 headers: {
//                     "Authorization": `Bearer ${token}`
//                 },
//                 json: request,
//                 timeout: 2000
//             });

//             let responseBody = JSON.parse(response.body.toString());
//             expect(response.statusCode).to.be.equal(200);
//             expect(responseBody.status).to.be.equal('fail');
//         });
//     });

//     it('Should fail to update mobile info if brand is invalid', function () {
//         this.timeout(5000);
//         let userCreationRequest = UserFixture.VALID;
//         apiClient.createUser(userCreationRequest);
//         const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
//         const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

//         let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

//         return apiClient.generateMobilePin(token, randomNumber).then(pin => {
//             let request = {
//                 "mobile": {
//                     "pinCode": pin,
//                     "number": randomNumber,
//                     "imei": randomIMEI,
//                     "brand": chance.word({ length: 60 }),
//                     "model": chance.syllable(),
//                     "so": chance.word(),
//                     "soVersion": `${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}`,
//                     "screenSize": `${chance.integer({ min: 100, max: 400 })}x${chance.integer({ min: 100, max: 400 })}`
//                 }
//             };

//             let response = http('POST', `${PROFILE_PATH}/mobile`, {
//                 headers: {
//                     "Authorization": `Bearer ${token}`
//                 },
//                 json: request,
//                 timeout: 5000
//             });

//             let responseBody = JSON.parse(response.body.toString());
//             expect(response.statusCode).to.be.equal(200);
//             expect(responseBody.status).to.be.equal('fail');
//         });
//     });

//     it('Should fail to update mobile info if model is invalid', function () {
//         let userCreationRequest = UserFixture.VALID;
//         apiClient.createUser(userCreationRequest);
//         const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
//         const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

//         let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

//         return apiClient.generateMobilePin(token, randomNumber).then(pin => {
//             let request = {
//                 "mobile": {
//                     "pinCode": pin,
//                     "number": randomNumber,
//                     "imei": randomIMEI,
//                     "brand": chance.word(),
//                     "model": chance.word({ length: 60 }),
//                     "so": chance.word(),
//                     "soVersion": `${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}`,
//                     "screenSize": `${chance.integer({ min: 100, max: 400 })}x${chance.integer({ min: 100, max: 400 })}`
//                 }
//             };

//             let response = http('POST', `${PROFILE_PATH}/mobile`, {
//                 headers: {
//                     "Authorization": `Bearer ${token}`
//                 },
//                 json: request,
//                 timeout: 2000
//             });

//             let responseBody = JSON.parse(response.body.toString());
//             expect(response.statusCode).to.be.equal(200);
//             expect(responseBody.status).to.be.equal('fail');
//         });
//     });

//     it('Should fail to update mobile info if so is invalid', function () {
//         let userCreationRequest = UserFixture.VALID;
//         apiClient.createUser(userCreationRequest);
//         const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
//         const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

//         let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

//         return apiClient.generateMobilePin(token, randomNumber).then(pin => {
//             let request = {
//                 "mobile": {
//                     "pinCode": pin,
//                     "number": randomNumber,
//                     "imei": randomIMEI,
//                     "brand": chance.word(),
//                     "model": chance.word(),
//                     "so": chance.word({ length: 60 }),
//                     "soVersion": `${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}.${chance.integer({ min: 1, max: 9 })}`,
//                     "screenSize": `${chance.integer({ min: 100, max: 400 })}x${chance.integer({ min: 100, max: 400 })}`
//                 }
//             };

//             let response = http('POST', `${PROFILE_PATH}/mobile`, {
//                 headers: {
//                     "Authorization": `Bearer ${token}`
//                 },
//                 json: request,
//                 timeout: 2000
//             });

//             let responseBody = JSON.parse(response.body.toString());
//             expect(response.statusCode).to.be.equal(200);
//             expect(responseBody.status).to.be.equal('fail');
//         });
//     });


//     it('Should fail to update mobile info if soVersion is invalid', function () {
//         let userCreationRequest = UserFixture.VALID;
//         apiClient.createUser(userCreationRequest);
//         const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
//         const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

//         let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

//         return apiClient.generateMobilePin(token, randomNumber).then(pin => {
//             let request = {
//                 "mobile": {
//                     "pinCode": pin,
//                     "number": randomNumber,
//                     "imei": randomIMEI,
//                     "brand": chance.word(),
//                     "model": chance.word(),
//                     "so": chance.word(),
//                     "soVersion": `${chance.integer({ min: 10000000000, max: 99999999999 })}.${chance.integer({ min: 10000000000, max: 99999999999 })}.${chance.integer({ min: 10000000000, max: 99999999999 })}`,
//                     "screenSize": `${chance.integer({ min: 100, max: 400 })}x${chance.integer({ min: 100, max: 400 })}`
//                 }
//             };

//             let response = http('POST', `${PROFILE_PATH}/mobile`, {
//                 headers: {
//                     "Authorization": `Bearer ${token}`
//                 },
//                 json: request,
//                 timeout: 2000
//             });

//             let responseBody = JSON.parse(response.body.toString());
//             expect(response.statusCode).to.be.equal(200);
//             expect(responseBody.status).to.be.equal('fail');
//         });
//     });

//     it('Should fail to update mobile info if soVersion is invalid', function () {
//         let userCreationRequest = UserFixture.VALID;
//         apiClient.createUser(userCreationRequest);
//         const randomNumber = chance.integer({ min: 11111111111, max: 99999999999 }).toString();
//         const randomIMEI = chance.integer({ min: 300988605208167, max: 300988605208167 }).toString();

//         let token = apiClient.generateToken(userCreationRequest.user.email, userCreationRequest.user.password);

//         return apiClient.generateMobilePin(token, randomNumber).then(pin => {
//             let request = {
//                 "mobile": {
//                     "pinCode": pin,
//                     "number": randomNumber,
//                     "imei": randomIMEI,
//                     "brand": chance.word(),
//                     "model": chance.word(),
//                     "so": chance.word(),
//                     "soVersion": `${chance.integer({ min: 100, max: 299 })}.${chance.integer({ min: 100, max: 299 })}.${chance.integer({ min: 100, max: 299 })}`,
//                     "screenSize": `${chance.integer({ min: 10000000000, max: 99999999999 })}x${chance.integer({ min: 10000000000, max: 99999999999 })}`
//                 }
//             };

//             let response = http('POST', `${PROFILE_PATH}/mobile`, {
//                 headers: {
//                     "Authorization": `Bearer ${token}`
//                 },
//                 json: request,
//                 timeout: 2000
//             });

//             let responseBody = JSON.parse(response.body.toString());
//             expect(response.statusCode).to.be.equal(200);
//             expect(responseBody.status).to.be.equal('fail');
//         });
//     });
 });


function getMobilePin(mobileNumber) {
    let client = require('redis').createClient({ 'password': 'originalmy' });
    return new Promise(function (resolve, reject) {
        client.get(mobileNumber, (err, res) => {
            err ? reject(err) : resolve(JSON.parse(res));
        })
    });
}