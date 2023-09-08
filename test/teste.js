var assert = require('assert')
  , assertPromise = require('assert-promise')
  , nconf = require('nconf')
  , async = require('async')
  , logger = require('winston')
  , _ = require('underscore')
  , request = require('request');

// Load Environment variables from .env file
require('dotenv').load({ silent: true });

// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables
nconf.env();

//Libs
var CacheRedis = require('../config/initializers/cache-redis')
  , Cache = new CacheRedis()
  , FactoryNotification = require('../app/factory/notification/notification-factory')

  , DocumentsHelper = require('../app/helpers/documents')
  , PinCodeHelper = require('../app/helpers/pin-code')
  , SendResponseHelper = require('../app/helpers/send-response')
  , UserHelper = require('../app/helpers/user')
  , FailModel = require('../app/models/response/fail')
  , SendSMSHelper = require('../app/helpers/send-sms')
  , UserValidateHelper = require('../app/helpers/user')

  , ConfigModel = require('../app/models/config/config')
  , LogAccessModel = require('../app/models/log/access')
  , NotificationModel = require('../app/models/notification/notification')
  , ValidationModel = require('../app/models/response/validation')
  , AddressModel = require('../app/models/user/address')
  , MobileModel = require('../app/models/user/mobile')
  , ProfileModel = require('../app/models/user/profile')
  , WalletModel = require('../app/models/wallet/wallet')

  , AddressService = require('../app/services/address')
  , AuthService = require('../app/services/auth')
  , ConfigService = require('../app/services/config')
  , MessageService = require('../app/services/message')
  , MobileService = require('../app/services/mobile')
  , NotificationService = require('../app/services/notification')
  , ProfileService = require('../app/services/profile')
  , TokenService = require('../app/services/token')
  , UserService = require('../app/services/user')

var mobile_pinCode = "12345"
  , mobile_number = "11999014046"
  , pin_code
  , email = 'teste@teste.com.br';

describe('Notification SMS', function () {
  this.timeout(150000);
  it('Auth Service LoginFacebook Without Register', function (done) {
    AuthService.loginFacebook({ emails: [{ value: 'teste99999@gmail.com' }] }, TokenService.generateAccessToken())
      .then(user => {
        assert.notEqual(user, null);
        done();
      })
  })
})

describe('Notification SMS', function () {
  this.timeout(150000);



  it('Notification Not Exists', function () {
    let notification = FactoryNotification.create('Other', {});
    assert.equal(notification, null);
  })
  it('Create Notification SMS', function () {
    let notification = FactoryNotification.create('SMSNotification', { "number": mobile_number, "pinCode": mobile_pinCode });
    assert.notEqual(notification.NotificationSend.params.Message, null);
    assert.notEqual(notification.NotificationSend.params.MessageStructure, null);
    assert.notEqual(notification.NotificationSend.params.PhoneNumber, null);
  })

  it('Create Notification SMS Send Without PinCode', function () {
    try {
      let notification = FactoryNotification.create('SMSNotification', { "number": mobile_number });
    } catch (err) {
      assert.notEqual(_.find(err.data.validations, (item) => item.key == "pinCode").key, null)
    }
  })
  it('Create Notification SMS Send Without Number', function () {
    try {
      let notification = FactoryNotification.create('SMSNotification', { "pinCode": pin_code });
    } catch (err) {
      assert.notEqual(_.find(err.data.validations, (item) => item.key == "number").key, null)
    }
  })
  it('Create Notification SMS Send Empty', function () {
    try {
      let notification = FactoryNotification.create('SMSNotification', {});
    } catch (err) {
      assert.equal(err.data.message, 'Erro na validação dos parâmetros')
    }
  })
  it('Create Notification SMS Send Without Parameters', function () {
    try {
      let notification = FactoryNotification.create('SMSNotification');
    } catch (err) {
      assert.equal(err.data.message, 'Erro na validação dos parâmetros')
    }
  })
  it('Create Notification SMS Send', function (done) {
    let notification = FactoryNotification.create('SMSNotification', { "number": mobile_number, "pinCode": mobile_pinCode });
    notification.send()
    .then(message => {
       assert.notEqual(message,null);
       done();
    })
  })
});

describe('Notification Email', function () {
  this.timeout(150000);
  it('Create EmailNotification Empty', function () {
    try {
      let notification = FactoryNotification.create('EmailNotification', {}, "");
    } catch (err) {
      assert.equal(err.data.message, 'Erro na validação dos parâmetros')
    }
  })
  it('Create EmailNotification Without Parameters', function () {
    try {
      let notification = FactoryNotification.create('EmailNotification');
    } catch (err) {
      assert.equal(err.data.message, 'Erro na validação dos parâmetros')
    }
  })
  it('Create EmailNotification Without User', function () {
    try {
      let notification = FactoryNotification.create('EmailNotification', null, "http://");
    } catch (err) {
      assert.equal(err.status, 'fail')
      assert.equal(err.data.type, 'validation')
      assert.notEqual(err.data.message, null)
    }
  })
  it('Create EmailNotification Without Link', function () {
    try {
      let notification = FactoryNotification.create('EmailNotification', { profile_email: email });
    } catch (err) {
      assert.notEqual(_.find(err.data.validations, (item) => item.key == "link").key, null)
    }
  })
  it('Create EmailNotification Send Recipients', function (done) {
    let notification = FactoryNotification.create('EmailNotification', { profile_email: email }, "http://");
    notification.send()
      .then(message => {
        assert.notEqual(message.response, null)
        assert.notEqual(message.messageId, null)
        done();
      })
  })
});

describe('Notification Reset Password', function () {
  this.timeout(150000);

  it('Create ResetPasswordNotification Empty', function () {
    try {
      let notification = FactoryNotification.create('ResetPasswordNotification', {});
    } catch (err) {
      assert.equal(err.data.message, 'Erro na validação dos parâmetros')
    }
  })
  it('Create ResetPasswordNotification Without Parameters', function () {
    try {
      let notification = FactoryNotification.create('ResetPasswordNotification');
    } catch (err) {
      assert.equal(err.data.message, 'Erro na validação dos parâmetros')
    }
  })
  it('Create ResetPasswordNotification Without User', function () {
    try {
      let notification = FactoryNotification.create('ResetPasswordNotification', null, pin_code);
    } catch (err) {
      assert.equal(err.status, 'fail')
      assert.equal(err.data.type, 'validation')
      assert.notEqual(err.data.message, null)
    }
  })
  it('Create ResetPasswordNotification Without Link', function () {
    try {
      let notification = FactoryNotification.create('ResetPasswordNotification', { profile_email: email });
    } catch (err) {
      assert.notEqual(_.find(err.data.validations, (item) => item.key == "pinCode").key, null)
    }
  })
  it('Create ResetPasswordNotification Send Recipients', function (done) {
    let notification = FactoryNotification.create('ResetPasswordNotification', { profile_email: email }, mobile_pinCode);
    notification.send()
      .then(message => {
        assert.notEqual(message.response, null)
        assert.notEqual(message.messageId, null)
        done();
      })
  })
});

describe(' DocumentsHelper', function () {
  this.timeout(150000);
  it('CPF Validate Empty', function () {
    assert.equal(DocumentsHelper.validateCPF(''), false)
  })
  it('CPF Validate True', function () {
    assert.equal(DocumentsHelper.validateCPF('46190917070'), true)
  })
  it('CPF Validate False', function () {
    assert.equal(DocumentsHelper.validateCPF('46190917055'), false)
  })
  it('VoteIdCard Validate Empty', function () {
    assert.equal(DocumentsHelper.validateVoteIdCard(''), false)
  })
  it('VoteIdCard Validate True', function () {
    assert.equal(DocumentsHelper.validateVoteIdCard('251613750159'), true)
  })
  it('VoteIdCard Validate False', function () {
    assert.equal(DocumentsHelper.validateVoteIdCard('46190917055'), false)
  })
});

describe('PinCode', function () {
  this.timeout(150000);
  it('PinCode Generate Empty', function () {
    assert.equal(PinCodeHelper.generatePincode(), false)
  })
  it('PinCode Generate True', function () {
    assert.notEqual(PinCodeHelper.generatePincode(5), null)
  })
  it('PinCode Validate Empty', function () {
    var pindCode = PinCodeHelper.generatePincode(5);
    Cache.setKey('11999887766', pindCode, 86400)
      .then(pinCode => {
      })
    try {
      PinCodeHelper.validatePinCode()
    } catch (err) {
      assert.equal(err.status, 'fail')
      assert.equal(err.data.type, 'validation')
      assert.notEqual(err.data.message, null)
    }
  })
  it('PinCode Validate True', function () {
    var pindCode = PinCodeHelper.generatePincode(5);
    Cache.setKey('11999887766', pindCode, 86400)
      .then(pinCode => {
      })
    PinCodeHelper.validatePinCode('11999887766', pindCode, 'ErrorMobileCreate', 'ErrorPinCode')
      .then(pincode => {
        assert.equal(pincode, true);
      })
  })
  it('PinCode Validate False', function () {
    var pindCode = PinCodeHelper.generatePincode(5);
    Cache.setKey('11999887765', pindCode, 86400)
      .then(pinCode => {
      })
    PinCodeHelper.validatePinCode('11999887766', pindCode, 'ErrorMobileCreate', 'ErrorPinCode')
      .catch(err => {
        assert.notEqual(_.find(err.data.validations, (item) => item.key == "pincode").key, null)
      })
  });
});

describe('SendSMS', function (done) {
  this.timeout(150000);
  it('SendSMS Without Parameters', function () {
    try {
      var sms = new SendSMSHelper();
    } catch (err) {
      assert.equal(err.status, 'fail')
      assert.equal(err.data.type, 'validation')
      assert.notEqual(err.data.message, null)
    }
  })
  it('SendSMS Without PinCode', function () {
    try {
      var sms = new SendSMSHelper({ number: '11999010446' });
    } catch (err) {
      assert.notEqual(_.find(err.data.validations, (item) => item.key == "pinCode").key, null)
    }
  })
  it('SendSMS Without Number', function () {
    try {
      var sms = new SendSMSHelper({ pinCode: '12345' });
    } catch (err) {
      assert.notEqual(_.find(err.data.validations, (item) => item.key == "number").key, null)
    }
  })
  it('SendSMS With Parameters', function () {
    var sms = new SendSMSHelper({ number: '11999010446', pinCode: '12345' });
    assert.notEqual(sms, null)
  })
  it('SendSMS Send', function (done) {
    var sms = new SendSMSHelper({ number: '11999010446', pinCode: '12345' });
    sms.send()
      .then(message => {
        assert.notEqual(message, null)
        done();
      })
  })
})

describe('Config', function () {
  this.timeout(150000);
  it('Config Existis', function (done) {
    ConfigModel.getConfig('difficulty')
      .then(config => {
        assert.notEqual(config.Value, null)
        done();
      })
  })
  it('Config NotExistis', function (done) {
    ConfigModel.getConfig('difficultys')
      .then(config => {
        assert.equal(config, undefined)
        done();
      })
  })
})


describe('Log', function () {
  this.timeout(150000);
  it('Access Success', function (done) {
    LogAccessModel.access('Teste', '128', 'teste', 0)
      .then(config => {
        assert.equal(config, true)
        done();
      })
  })
  it('Access Error', function (done) {
    LogAccessModel.access()
      .then(config => {
        assert.equal(config, true)
        done();
      })
  })
})


describe('Notification validateUserCorfirm', function () {
  this.timeout(150000);
  it('Notification Validade User Confirm Success', function (done) {
    NotificationModel.validateUserCorfirm({ user_id: 128 })
      .then(notification => {
        assert.notEqual(notification.user_validate, "")
        done();
      })
  })
  it('Notification Validade User Confirm Error', function (done) {
    NotificationModel.validateUserCorfirm()
      .catch(err => {
        assert.notEqual(err.message, null)
        done();
      })
  })
})

describe('Validation validateRequest', function () {
  this.timeout(150000);
  it('Validation Request Success', function () {
    assert.equal(ValidationModel.validateRequestSync('mobileNotification', 'ErrorParameter', { number: '11999887766', pinCode: '12345' }), true)
  })
  it('Validation Request Error', function () {
    try {
      ValidationModel.validateRequestSync()
    } catch (err) {
      assert.notEqual(err.data.message, null)
      assert.notEqual(err.status, null)
    }
  })
})

describe('AddressModel searchGoogleApi', function () {
  this.timeout(150000);
  it('AddressModel searchGoogleApi Success', function (done) {
    AddressModel.searchGoogleApi('05305012')
      .then(address => {
        assert.equal(JSON.parse(address).status, 'OK')
        assert.notEqual(_.first(JSON.parse(address).results).formatted_address, null)
        done();
      })
  })
  it('AddressModel searchGoogleApi Error', function (done) {
    AddressModel.searchGoogleApi('')
      .catch(err => {
        assert.notEqual(err, null)
        done();
      })
  })
})

describe('MobileModel updateMobile', function () {
  this.timeout(150000);
  it('MobileModel updateMobile Success', function (done) {
    var mobile = {
      "id": "26",
      "pinCode": "97186",
      "number": "11999014099",
      "imei": "300988605208167",
      "brand": "samsung",
      "model": "J5",
      "so": "android",
      "soVersion": "6.0.1",
      "screenSize": "320x480"
    };
    var user = { user_id: 128 };
    MobileModel.updateMobile(mobile, user)
      .then(user => {
        assert.notEqual(user.mobile_id, null)
        done();
      })
  })
  it('MobileModel updateMobile Error', function (done) {
    MobileModel.updateMobile('')
      .catch(err => {
        assert.notEqual(err, null)
        done();
      })
  })
})

describe('MobileModel findByNumber', function () {
  this.timeout(150000);
  it('MobileModel findByNumber Success', function (done) {
    var mobile = {
      "id": "26",
      "pinCode": "97186",
      "number": "11999014099",
      "imei": "300988605208167",
      "brand": "samsung",
      "model": "J5",
      "so": "android",
      "soVersion": "6.0.1",
      "screenSize": "320x480"
    };
    var user = { user_id: 128 };
    MobileModel.findByNumber(mobile, user)
      .then(mobile => {
        assert.notEqual(mobile.mobile_id, null)
        done();
      })
  })
})


describe('MobileModel createMobileBasic', function () {
  this.timeout(150000);
  it('MobileModel createMobileBasic Success', function (done) {
    var mobile = {
      "pinCode": "97186",
      "number": "11999014099"
    };
    var user = { user_id: 128 };
    MobileModel.createMobileBasic(mobile, user)
      .then(mobile => {
        assert.notEqual(mobile, null)
        done();
      })
  })
})

describe('ProfileModel updateUserBirthday', function () {
  this.timeout(150000);
  it('ProfileModel validateUser Success', function (done) {
    var user = { user_id: 128 };
    var userBithDay = { "birthday": "1978-11-15" };
    ProfileModel.updateUserBirthday(userBithDay, user)
      .then(user => {
        assert.notEqual(user, null)
        done();
      })
  })
  it('ProfileModel updateUserBirthday Error', function (done) {
    ProfileModel.updateUserBirthday()
      .catch(err => {
        assert.notEqual(err, null)
        done();
      })
  })
})



describe('ProfileModel updateUserZipCode', function () {
  this.timeout(150000);
  it('ProfileModel updateUserZipCode Success', function (done) {
    var user = { user_id: 128 };
    var userZipCode = { "zipcode": "02150010" };
    ProfileModel.updateUserZipCode(userZipCode, user)
      .then(mobile => {
        assert.notEqual(mobile, null)
        done();
      })
  })
  it('ProfileModel updateUserZipCode Error', function (done) {
    ProfileModel.updateUserZipCode()
      .catch(err => {
        assert.notEqual(err, null)
        done();
      })
  })
})


describe('ProfileModel updateUserDocuments', function () {
  this.timeout(150000);
  it('ProfileModel updateUserDocuments Success', function (done) {
    var user = { user_id: 128 };
    var userDocuments = { "voteidcard": "251613750159", "cpf": "18532435823" };
    ProfileModel.updateUserDocuments(userDocuments, user)
      .then(mobile => {
        assert.notEqual(mobile, null)
        done();
      })
  })
  it('ProfileModel updateUserDocuments Error', function (done) {
    ProfileModel.updateUserDocuments()
      .catch(err => {
        assert.notEqual(err, null)
        done();
      })
  })
})

describe('WalletModel insertUserWallet', function () {
  this.timeout(150000);
  it('WalletModel insertUserWallet Success', function (done) {
    var userWallet = { user_id: 128, "walletKey": "12WRUyfsQ7V1hAhG9ZJ7xd82EoEq1CKHXc" };
    WalletModel.insertUserWallet(userWallet)
      .then(user => {
        assert.notEqual(user, null)
        done();
      })
  })
  it('WalletModel insertUserWallet Error', function (done) {
    WalletModel.insertUserWallet()
      .catch(err => {
        assert.notEqual(err, null)
        done();
      })
  })
})


describe('WalletModel getWalletByUserId', function () {
  this.timeout(150000);
  it('WalletModel getWalletByUserId Success', function (done) {
    WalletModel.getWalletByUserId(128)
      .then(wallet => {
        assert.notEqual(wallet, null)
        done();
      })
  })
  it('WalletModel getWalletByUserId Error', function (done) {
    WalletModel.getWalletByUserId()
      .then(wallet => {
        assert.equal(wallet, null)
        done();
      })
  })
})


describe('Address Service', function () {
  this.timeout(150000);
  it('Address Service searchGoogleApi Success', function (done) {
    AddressService.searchGoogleApi('05305012')
      .then(address => {
        assert.equal(address.status, 'success')
        assert.notEqual(address.data.address, null)
        assert.notEqual(address.data.zipcode, null)
        assert.notEqual(address.data.lat, null)
        assert.notEqual(address.data.lng, null)
        done();
      })
  })
  it('Address Service searchGoogleApi Fail', function (done) {
    AddressService.searchGoogleApi('aaa')
      .catch(err => {
        assert.equal(err.status, 'fail')
        assert.equal(err.data.type, 'validation')
        assert.notEqual(err.data.message, null)
        done();
      })
  })
})

describe('Auth Service', function () {
  this.timeout(150000);
  it('Auth Service LoginFacebook With Register', function (done) {
    AuthService.loginFacebook({ emails: [{ value: email }] }, TokenService.generateAccessToken())
      .then(user => {
        assert.notEqual(user, null);
        done();
      })
  })
  it('Auth Service LoginFacebook Without Register', function (done) {
    AuthService.loginFacebook({ emails: [{ value: 'teste99999@gmail.com' }] }, TokenService.generateAccessToken())
      .then(user => {
        assert.notEqual(user, null);
        done();
      })
  })
  it('Auth Service Login With Register', function (done) {
    AuthService.login(email, '123456', TokenService.generateAccessToken())
      .then(user => {
        assert.notEqual(user, null);
        done();
      })
      .catch(err => {
        assert.equal(err.status, 'fail')
        assert.equal(err.data.type, 'authentication')
        assert.notEqual(err.data.message, null)
        done();
      })
  })
  it('Auth Service Login Without Register', function (done) {
    AuthService.login('teste9999@gmail.com', '123456', TokenService.generateAccessToken())
      .catch(err => {
        assert.equal(err.status, 'fail')
        assert.equal(err.data.type, 'authentication')
        assert.notEqual(err.data.message, null)
        done();
      })
  })
})

describe('Config Service', function () {
  this.timeout(150000);
  it('Config Service getConfigKey Success', function (done) {
    ConfigService.getConfigKey('difficulty')
      .then(config => {
        assert.equal(config.status, 'success');
        assert.notEqual(config.data.config.value, null);
        assert.notEqual(config.data.config.key, null);
        done();
      })
  })
  it('Config Service getConfigKey Fail', function (done) {
    ConfigService.getConfigKey('aaa')
      .catch(err => {
        assert.equal(err.status, 'fail');
        assert.equal(err.data.type, 'validation');
        assert.notEqual(err.data.message, null);
        done();
      })
  })
})


describe('Message Service', function () {
  this.timeout(150000);
  it('Message Service getMessagePlipByUser Success', function (done) {
    var accessToken = TokenService.generateAccessToken();
    var user = { user_id: 128 };
    Cache.setKeySync(accessToken.access_token, JSON.stringify(user), 86400);

    MessageService.getMessagePlipByUser(1, accessToken.access_token)
      .then(message => {
        assert.equal(message.status, 'success');
        assert.notEqual(message.data.signMessage, null);
        assert.notEqual(message.data.signMessage.updatedAt, null);
        done();
      })
  })
  it('Message Service getMessagePlipByUser Fail', function (done) {
    var accessToken = TokenService.generateAccessToken();
    var user = { user_id: 999 };
    Cache.setKeySync(accessToken.access_token, JSON.stringify(user), 86400);

    MessageService.getMessagePlipByUser(2, accessToken.access_token)
      .then(message => {
        assert.equal(message.status, 'success');
        assert.equal(message.data.info, undefined);
        done();
      })
  })
})
describe('Message Service Plip', function () {
  this.timeout(150000);
  it('Message Service getMessagePlipById Success', function (done) {
    MessageService.getMessagePlipById(1)
      .then(message => {
        assert.equal(message.status, 'success');
        assert.notEqual(message.data.info, null);
        assert.notEqual(message.data.info.updatedAt, null);
        done();
      })
  })
  it('Message Service getMessagePlipById Fail', function (done) {
    MessageService.getMessagePlipById(2)
      .then(message => {
        assert.equal(message.status, 'success');
        assert.notEqual(message.data.info, null);
        assert.equal(message.data.info.updatedAt, null);
        done();
      })
  })
})

describe('Message Service SignMessage', function () {
  this.timeout(150000);
  it('Message Service getMessagePlipById Success', function (done) {
    var accessToken = TokenService.generateAccessToken();
    var user = { user_id: 128 };
    Cache.setKeySync(accessToken.access_token, JSON.stringify(user), 86400);
    var signMessage = { "petitionId": 1, "block": "fff;13224240;273173730116;2016-12-16T11:12:46.358Z;Lei da Ficha Limpa;1;1Afp2tpLFLfVm6mnmBmsLfveesaoBsun1A;ILLwP7CJZRwBY/KS56965sYhMukUeXbf0js299YrVuqZP/zSNZWZo+nJTXkOPjB321eMonN1dhTkoN5wxK3n3Zk=;1351" };
    MessageService.signMessage(signMessage, accessToken.access_token, '127.0.0.1')
      .then(message => {
        assert.equal(message.status, 'success');
        assert.notEqual(message.data.signMessage, null);
        assert.notEqual(message.data.signMessage.dateTime, null);
        done();
      })
  })
  it('Message Service SignMessage Fail', function (done) {
    var accessToken = TokenService.generateAccessToken();
    var user = { user_id: 999 };
    Cache.setKeySync(accessToken.access_token, JSON.stringify(user), 86400);
    var signMessage = { "petitionId": 1, "block": "fff;13224240;273173730116;2016-12-16T11:12:46.358Z;Lei da Ficha Limpa;1;1Afp2tpLFLfVm6mnmBmsLfveesaoBsun1A;ILLwP7CJZRwBY/KS56965sYhMukUeXbf0js299YrVuqZP/zSNZWZo+nJTXkOPjB321eMonN1dhTkoN5wxK3n3Zk=;1351" };
    MessageService.signMessage(signMessage, accessToken.access_token, '127.0.0.1')
      .catch(err => {
        assert.equal(err.status, 'fail');
        assert.equal(err.data.type, 'validation');
        assert.notEqual(err.data.message, null);
        assert.notEqual(err.data.validations[0].key, null);
        done();
      })
  })
})



describe('MobileService createMobileAndPinCode', function () {
  this.timeout(150000);
  it('MobileService createMobileAndPinCode Success', function (done) {
    var accessToken = TokenService.generateAccessToken();
    var user = { user_id: 128 };
    var mobile = { number: mobile_number }
    Cache.setKeySync(accessToken.access_token, JSON.stringify(user), 86400);
    MobileService.createMobileAndPinCode(mobile, accessToken.access_token)
      .then(pinCode => {
        mobile_pinCode = pinCode.data;
        assert.equal(pinCode.status, 'success');
        assert.notEqual(pinCode.data, null);
        done();
      })
  })
  it('MobileService createMobileAndPinCode Fail', function (done) {

      MobileService.createMobileAndPinCode()
      .catch(err => {
        assert.equal(err.status, 'fail');
        assert.equal(err.data.type, 'validation');
        assert.notEqual(err.data.message, null);
        done();
      });
  })
})


describe('MobileService updateMobile', function () {
  this.timeout(150000);
  it('MobileService updateMobile Success', function (done) {
    var accessToken = TokenService.generateAccessToken();
    var user = { user_id: 128 };
    var mobile = {
      "pinCode": mobile_pinCode.toString(),
      "number": mobile_number,
      "imei": "300988605208167",
      "brand": "samsung",
      "model": "J5",
      "so": "android",
      "soVersion": "6.0.1",
      "screenSize": "320x480"
    };
    Cache.setKeySync(accessToken.access_token, JSON.stringify(user), 86400);
    MobileService.updateMobile(mobile, accessToken.access_token)
      .then(pinCode => {
        assert.notEqual(pinCode, null);
        done();
      })
  })
  it('MobileService updateMobile Fail', function (done) {

      MobileService.updateMobile()
    .catch(err => {
      assert.equal(err.status, 'fail');
      assert.equal(err.data.type, 'validation');
      assert.notEqual(err.data.message, null);
      done();
    })
  })
})


describe('NotificationService Service createMobileAndPinCode', function () {
  this.timeout(150000);
  it('NotificationService Service createMobileAndPinCode Success', function (done) {
    var user = { user_id: 128 };
    var mobile = {
      "number": mobile_number,
      "imei": "300988605208167",
      "brand": "samsung",
      "model": "J5",
      "so": "android",
      "soVersion": "6.0.1",
      "screenSize": "320x480"
    };
    NotificationService.createMobileAndPinCode(mobile, user)
      .then(pinCode => {
        assert.notEqual(pinCode, null);
        done();
      })
  })
  it('NotificationService Service createMobileAndPinCode Fail', function (done) {
      NotificationService.createMobileAndPinCode()
    .catch(err => {
      assert.equal(err.status, 'fail');
      assert.equal(err.data.type, 'validation');
      assert.notEqual(err.data.message, null);
      done();
    })
  })
})


describe('NotificationService Service sendSMS', function () {
  this.timeout(150000);
  it('NotificationService Service sendSMS Success', function (done) {
    var mobile = {
      "pinCode": mobile_pinCode.toString(),
      "number": mobile_number
    };
    NotificationService.sendSMS(mobile)
      .then(message => {
        assert.equal(message.status, 'success');
        assert.notEqual(message.data.info, null)
        done();
      }).catch(err => console.log(err))
  })
  it('NotificationService Service sendSMS Fail', function (done) {
    try {
      NotificationService.sendSMS()
    } catch (err) {
      assert.equal(err.status, 'fail');
      assert.equal(err.data.type, 'validation');
      assert.notEqual(err.data.message, null);
      done();
    }
  })
})



describe('NotificationService Service generateLinkNotificationEmail', function () {
  this.timeout(150000);
  it('NotificationService Service generateLinkNotificationEmail Success', function (done) {
    var message = NotificationService.generateLinkNotificationEmail({}, 'Notification_Email', TokenService.generateAccessToken())
    assert.notEqual(message, null)
    done();
  })
  it('NotificationService Service generateLinkNotificationEmail Fail', function (done) {

    try {
      NotificationService.generateLinkNotificationEmail()
    } catch (err) {
      assert.equal(err.status, 'fail');
      assert.equal(err.data.type, 'validation');
      assert.notEqual(err.data.message, null);
      done();
    }
  })
})

// describe('NotificationService Service sendMessage', function () {
//   this.timeout(150000);
//   it('NotificationService Service sendMessage Success', function (done) {
//   })
//   it('NotificationService Service sendMessage Fail', function (done) {
//   })
// })


// describe('NotificationService Service validateNotificationMessage', function () {
//   this.timeout(150000);
//   it('NotificationService Service validateNotificationMessage Success', function (done) {
//   })
//   it('NotificationService Service validateNotificationMessage Fail', function (done) {
//   })
// })


// describe('NotificationService Service generateLinkNotificationEmail', function () {
//   this.timeout(150000);
//   it('NotificationService Service generateLinkNotificationEmail Success', function (done) {
//   })
//   it('NotificationService Service generateLinkNotificationEmail Fail', function (done) {
//   })
// })

// describe('ProfileService Service validateUser', function () {
//   this.timeout(150000);
//   it('ProfileService Service validateUser Success', function (done) {
//   })
//   it('ProfileService Service validateUser Fail', function (done) {
//   })
// })

// describe('ProfileService Service updateUserBirthday', function () {
//   this.timeout(150000);
//   it('ProfileService Service updateUserBirthday Success', function (done) {
//   })
//   it('ProfileService Service updateUserBirthday Fail', function (done) {
//   })
// })

// describe('ProfileService Service updateUserZipCode', function () {
//   this.timeout(150000);
//   it('ProfileService Service updateUserZipCode Success', function (done) {
//   })
//   it('ProfileService Service updateUserZipCode Fail', function (done) {
//   })
// })

// describe('ProfileService Service updateUser DocumentsHelper', function () {
//   this.timeout(150000);
//   it('ProfileService Service updateUser DocumentsHelper Success', function (done) {
//   })
//   it('ProfileService Service updateUser DocumentsHelper Fail', function (done) {
//   })
// })

// describe('ProfileService Service insertUserWallet', function () {
//   this.timeout(150000);
//   it('ProfileService Service insertUserWallet Success', function (done) {
//   })
//   it('ProfileService Service insertUserWallet Fail', function (done) {
//   })
// })


// describe('TokenService Service generateAccessToken', function () {
//   this.timeout(150000);
//   it('TokenService Service generateAccessToken Success', function (done) {
//   })
//   it('TokenService Service generateAccessToken Fail', function (done) {
//   })
// })

// describe('TokenService Service generatNotificationToken', function () {
//   this.timeout(150000);
//   it('TokenService Service generatNotificationToken Success', function (done) {
//   })
//   it('TokenService Service generatNotificationToken Fail', function (done) {
//   })
// })

// describe('UserService Service createUserFacebook', function () {
//   this.timeout(150000);
//   it('UserService Service createUserFacebook Success', function (done) {
//   })
//   it('UserService Service createUserFacebook Fail', function (done) {
//   })
// })

// describe('UserService Service createUserLogin', function () {
//   this.timeout(150000);
//   it('UserService Service createUserLogin Success', function (done) {
//   })
//   it('UserService Service createUserLogin Fail', function (done) {
//   })
// })

// describe('UserService Service updateUserLogin', function () {
//   this.timeout(150000);
//   it('UserService Service updateUserLogin Success', function (done) {
//   })
//   it('UserService Service updateUserLogin Fail', function (done) {
//   })
// })

// describe('UserService Service updateUser', function () {
//   this.timeout(150000);
//   it('UserService Service updateUser Success', function (done) {
//   })
//   it('UserService Service updateUser Fail', function (done) {
//   })
// })

// describe('UserService Service getAll', function () {
//   this.timeout(150000);
//   it('UserService Service getAll Success', function (done) {
//   })
//   it('UserService Service getAll Fail', function (done) {
//   })
// })

// describe('UserService Service findById', function () {
//   this.timeout(150000);
//   it('UserService Service findById Success', function (done) {
//   })
//   it('UserService Service findById Fail', function (done) {
//   })
// })

// describe('UserService Service resetPassword', function () {
//   this.timeout(150000);
//   it('UserService Service resetPassword Success', function (done) {
//   })
//   it('UserService Service resetPassword Fail', function (done) {
//   })
// })

// describe('UserService Service updateUserPasswordPinCode', function () {
//   this.timeout(150000);
//   it('UserService Service updateUserPasswordPinCode Success', function (done) {
//   })
//   it('UserService Service updateUserPasswordPinCode Fail', function (done) {
//   })
// })

// describe('UserService Service updatePassword', function () {
//   this.timeout(150000);
//   it('UserService Service updatePassword Success', function (done) {
//   })
//   it('UserService Service updatePassword Fail', function (done) {
//   })
// })


// describe('UserHelper validateComplete', function () {
//   this.timeout(150000);
//   it('UserHelper validateComplete Success', function (done) {
//   })
//   it('UserHelper validateComplete Fail', function (done) {
//   })
// })
