var MobileModel = require('../models/user/mobile')
  , CacheRedis = require('../../config/initializers/cache-redis')
  , Cache = new CacheRedis()
  , FactoryNotification = require('../../libs/factory/notification/notification-factory')
  , SuccessModel = require('../../libs/models/response/success')
  , config = require('nconf')
  , listErrors = require('../../libs/helpers/errors-list')
  , PinCode = require('../../libs/helpers/pin-code')
  , TokenService = require('./token')
  , NotificationModel = require('../models/notification/notification')
  , UserModel = require('../models/user/user')
  , PetitionModel = require('../models/petition/petition')
  , FailModel = require('../../libs/models/response/fail')
  , ValidationModel = require('../../libs/models/response/validation')
  , ValidateAttribute = require('../../libs/models/validate/attribute')
  , AWS = require('aws-sdk')
  , extend = require('extend');

const notificationExpire = parseInt(config.get("CACHE_TIME_NOTIFICATION"), 10);
const mobileExpire = parseInt(config.get("CACHE_TIME_MOBILE"), 10);

class Notification {
  constructor() { }

  static createMobileAndPinCode(mobile, user) {
    var _pindCode = PinCode.generatePincode(5);
    return ValidationModel.validateRequest('mobileNumber', 'ErrorMobileCreate', mobile)
      .then(success => {
        return Cache.setKey(mobile.number, JSON.stringify({ pinCode: _pindCode }), mobileExpire)
      })
      .then(pinCode => {
        mobile.pinCode = JSON.parse(pinCode).pinCode;
        return MobileModel.createMobileBasic(mobile, user);
      })
  }

  static sendSMS(mobile) {
    return FactoryNotification.create('SMSNotification', mobile)
      .send()
      .then(info => {
        return new SuccessModel('success', { info: info });
      })
  }

  static generateLinkNotificationEmail(object, typeName, accessToken) {
    if (ValidationModel.validateRequestSync('accessToken', 'ErrorAccessToken', accessToken)) {
      object.accessToken = accessToken.access_token || null;
      var token = TokenService.generatNotificationToken(typeName);
      object.token = token;
      var cache = Cache.setKeySync(token.access_token, JSON.stringify(object), notificationExpire);
      if (cache) {
        delete object.accessToken
        delete object.token;
        return `${config.get('NOTIFICATION_CONFIRMATION_LINK')}${token.access_token}`;
      }
    }
  }


  static sendMessage(name, user, petition, link) {
    return FactoryNotification.create(name, user, petition, link)
      .send()
      .then(info => {
        return new SuccessModel('success', { info: info.response });
      })
  }

  static getNotificationTemplate(type) {
    var templates = {
      'Notification_Email': 'confirmation_v1/confirmation-email',
      'Remove_Account_Email': 'confirmation_v1/remove-account-confirmation-email'
    };
    return templates[type];
  }

  static getNotificationTemplateError(type) {
    var templates = {
      'validation': 'confirmation_v1/confirmation-error',
      'Notification_Email': 'confirmation_v1/confirmation-error',
      'Remove_Account_Email': 'confirmation_v1/remove-account-confirmation-email-error'
    };
    return templates[type];
  }

  static getNotificationFunction(type) {
    var templates = {
      'Notification_Email': (param) => { return Notification.validateNotificationMessage(param) },
      'Remove_Account_Email': (param) => { return Notification.validateRemoveAccountNotification(param) }
    };
    return templates[type];
  }

  static validateRemoveAccountNotification(token_user) {
    var _user;
    return UserModel.findById(token_user.user_id)
      .then(user => {
        _user = user;
        if (!_user)
          throw new FailModel('fail', token_user.token.token_type, listErrors['ErrorUserNotFound'].message, listErrors['ErrorUserNotFound'].errorCode);
        return UserModel.removeAccount(_user.user_id);
      })
      .then(success => {
        if (!success)
          throw new FailModel('fail', 'validation', { error: listErrors['ErrorRemoveAccount'].message, user: null, type: token_user.token.token_type }, listErrors['ErrorRemoveAccount'].errorCode);
        return PetitionModel.findLastActive();
      })
      .then(petition => {
        _user.page_url = petition && petition.page_url || '';
        return { user: _user, type: token_user.token.token_type };
      })
  }

  static validateNotification(accessToken) {
    return Cache.getKey(accessToken)
      .then(token_user => {
        token_user = JSON.parse(token_user);
        if (!token_user  || !token_user.token) {
          throw new ValidationModel('fail', 'validation', listErrors['ErrorNotificationToken'].message, [new ValidateAttribute('ErrorNotificationToken', listErrors['ErrorNotificationToken'].message)], listErrors['ErrorNotificationToken'].errorCode);
        } else {
          return Notification.getNotificationFunction(token_user.token.token_type)(token_user);
        }
      })
  }

  static validateNotificationMessage(token_user) {
    var _user;
    return UserModel.findById(token_user.user_id)
      .then(user => {
        if (user && user.user_validate)
          throw new FailModel('fail', token_user.token.token_type,  listErrors['ErrorNotification'].message, listErrors['ErrorNotification'].errorCode);
        return NotificationModel.validateUserCorfirm(user)
      })
      .then(user => {
        _user = user;
        return Cache.setKey(token_user.accessToken, JSON.stringify(user))
      })
      .then(user => {
        return PetitionModel.findLastActive();
      })
      .then(petition => {
        _user.page_url = petition && petition.page_url || '';
        return { user: _user, type: token_user.token.token_type };
      })
  }
}

module.exports = Notification;
