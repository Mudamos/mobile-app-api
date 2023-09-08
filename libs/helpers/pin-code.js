var listErrors = require('./errors-list')
  , CacheRedis = require('../../config/initializers/cache-redis')
	, Cache = new CacheRedis()
  , ValidationModel = require('../models/response/validation')
	, ValidateAttribute = require('../models/validate/attribute');

class PinCode {

  constructor() { }

  static generatePincode(pinLength) {
    var pinCodeArray = []
    for (var i = 0; i < pinLength; i++) {
      pinCodeArray.push(Math.floor(Math.random() * 10))
    }
    return pinCodeArray.join('')
  }

  static validatePinCode(key, pinCodeValidate, errorMessage, errorPinCode) {
    if(!key || !pinCodeValidate || !errorMessage  || !errorPinCode)
			throw new ValidationModel('fail', 'validation', listErrors['ErrorParameter'].message, nulll, listErrors['ErrorParameter'].errorCode);
    return new Promise((resolve, reject) => {
      Cache.getKey(key)
        .then(object => {
          object = JSON.parse(object)
          if (!object || pinCodeValidate != object.pinCode){
            reject(new ValidationModel('fail', 'validation', listErrors[errorMessage].message, [new ValidateAttribute('pincode', listErrors[errorPinCode].message)],listErrors[errorPinCode].errorCode));
          }
          else{
            Cache.deleteKeySync(key);
            resolve(object)
          }
        })
    });
  }
}

module.exports = PinCode; 
