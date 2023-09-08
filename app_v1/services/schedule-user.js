const nconf = require('nconf')
const path = require('path')
const _ = require('lodash')
const config = require('nconf')
const AWS = require('aws-sdk')
const async = require('async')
const ScheduleHelper = require('../../libs/helpers/schedule');

require('dotenv').load({ silent: true });
// nconf.overrides({
//     'DB_CONNECTIONS_LIMIT': '10'
// });


nconf
  .use('memory')
  .argv()
  .env();

const UserModel = require('../models/user/user')
const TraceModel = require('../../libs/models/log/trace')
// const Connection = require('../../config/initializers/database');

function getUserMessages(sqs, urlQueue) {
  return new Promise((resolve, reject) => {
    var params = {
      AttributeNames: [
        "All"
      ],
      MaxNumberOfMessages: parseInt(config.get("AWS_REGION_MESSAGE_RECEIVE_QTD"), 10),
      MessageAttributeNames: [
        "All"
      ],
      QueueUrl: urlQueue,
      VisibilityTimeout: 123,
      WaitTimeSeconds: 20
    };
    sqs.receiveMessage(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data.Messages);
      }
    });
  })
}

function removeUserMessages(message, urlQueue, sqs) {
  return new Promise((resolve, reject) => {
    var deleteParams = {
      QueueUrl: urlQueue,
      ReceiptHandle: message.ReceiptHandle
    };
    sqs.deleteMessage(deleteParams, function (err, data) {
      if (err) {
        console.log("Delete Error", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}

class ScheduleUser {

  static starImportUserMudamos() {

      AWS.config.update({
        'region': config.get('AWS_REGION_SQS'),
        'accessKeyId': config.get('AWS_ACCESSKEY_ID'),
        'secretAccessKey': config.get('AWS_ACCESSKEY_SECRET')
      });

      const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

      return ScheduleHelper.getQueue(sqs, config.get('AWS_SQS_USER'))
        .then(urlQueue => getUserMessages(sqs, urlQueue).then(messages => ({ urlQueue, messages })))
        .then(({ urlQueue, messages }) => Promise.all((messages || []).map(message => {
            const user = JSON.parse(message.Body);
            return UserModel.findByEmail(user.email)
              .then(userDb => userDb || UserModel.createUserLoginMudamos({ name: User.clearChar(user.name), email: user.email, hashPassCrypth: user.password, picture: user.picture_url, birthday: user.birthday }))
              .then(userInsert => userInsert && TraceModel.log('PROCESS-USER-MUDAMOS', `User  : ${JSON.stringify(user)}`, `User  : ${JSON.stringify(user_insert)}`, false))
              .then(success => success && removeUserMessages(message, urlQueue, sqs))
              .then(message => message && TraceModel.log('PROCESS-USER-MUDAMOS', `Message  : ${JSON.stringify(message)}`, '', false))
              .catch(err => TraceModel.log('PROCESS-USER-MUDAMOS', `User  : ${JSON.stringify(user)}`, `Err  : ${JSON.stringify(err)}`, true))
          })))
  }
}

module.exports = ScheduleUser;
