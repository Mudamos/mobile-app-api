var config = require('nconf')
  , AWS = require('aws-sdk')
  , FailModel = require('../models/response/fail')
  , listErrors = require('./errors-list')
  , ValidationModel = require('../models/response/validation');
class SendSMS {

  constructor(mobile, { message } = {}) {
    if (ValidationModel.validateRequestSync('mobileNotification', 'ErrorParameter', mobile)) {
      this.sns = new AWS.SNS({
        accessKeyId: config.get('AWS_ACCESSKEY_ID'),
        secretAccessKey: config.get('AWS_ACCESSKEY_SECRET'),
        region: config.get('AWS_SMS_REGION'),
      });

      this.params = {
        Message: message || `Seu codigo de verificacao mudamos.org : ${mobile.pinCode}`,
        MessageStructure: 'string',
        PhoneNumber: `+55${mobile.number}`
      };
    }
  }

  send() {
    var that = this;
    return new Promise(function (resolve, reject) {
      that.sns.publish(that.params, function (err, data) {
        if (err)
          throw new FailModel('fail', 'validation', listErrors['ErrorSMSSend'.message, listErrors['ErrorSMSSend'].errorCode]);
        else
          resolve(data.MessageId);
      })
    });
  }
}

module.exports = SendSMS;
