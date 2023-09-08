var listErrors = require('../../libs/helpers/errors-list')
  , Promise = require('promise')
  , UserValidate = require('../../libs/helpers/user')
  , PinCode = require('../../libs/helpers/pin-code')
  , MobileModel = require('../models/user/mobile')
  , ValidationModel = require('../../libs/models/response/validation')
  , SuccessModel = require('../../libs/models/response/success')
  , ValidateAttribute = require('../../libs/models/validate/attribute')
  , NotificationService = require('./notification')
  , CacheRedis = require('../../config/initializers/cache-redis')
  , Cache = new CacheRedis()
  , async = require('async');

function generatePincode(pinLength) {
  var pinCodeArray = []
  for (var i = 0; i < pinLength; i++) {
    pinCodeArray.push(Math.floor(Math.random() * 10))
  }

  return pinCodeArray.join('')
}

class MobileService {
  constructor() { }

  static createMobileAndPinCode(mobile, accessToken) {
      return ValidationModel.validateRequest('mobileNumber', 'ErrorMobileCreate', mobile)
        .then(success => {
          return Cache.getKey(accessToken);
        })
        .then(user_cache => {
          _user = JSON.parse(user_cache)
          return NotificationService.createMobileAndPinCode(mobile, _user);
        })
        .then(pinCode => { 
            NotificationService.sendSMS(mobile) 
            return pinCode; 
          })
        .then(pinCode => {
          return new SuccessModel('success', pinCode);
        })
  }

  static updateMobile(mobile, accessToken) {
    var user;
      return ValidationModel.validateRequest('mobile', 'ErrorMobileCreate', mobile)
        .then(success => {
          return PinCode.validatePinCode(mobile.number, mobile.pinCode, 'ErrorMobileCreate', 'ErrorPinCode')
        })
        .then(ok => {
         return Cache.getKey(accessToken)
        })
        .then(user_cache => {
          user = JSON.parse(user_cache);
          return MobileModel.findByNumber(mobile, JSON.parse(user_cache));
        })
        .then(mobile_result => {
          mobile.id = mobile_result.mobile_id;
          return MobileModel.updateMobile(mobile, user);
        })
        .then(user_set => {
          return Cache.setKey(accessToken, JSON.stringify(user_set))
        })
        .then(user_new => {
          user_new = JSON.parse(user_new);
          return new SuccessModel('success', { user: user_new, complete: UserValidate.validateComplete(user_new) });
        })
  }
}

module.exports = MobileService;
