
const nconf = require('nconf');
const path = require('path');
const _ = require('lodash');
const config = require('nconf');
const AWS = require('aws-sdk');
const async = require('async');
const crypto = require('crypto');
const Connection = require('./../../config/initializers/database')
require('dotenv').load({ silent: true });

const appConfig = require("../../config")();
const { logCreator } = require("../../src/services");
const { logger } = logCreator(appConfig);

nconf
  .use('memory')
  .argv()
  .env();

const UserModel = require('../models/user/user');

const ScheduleBatch = require('./schedule-batch');
const ScheduleBlackList = require('./schedule-blacklist');
const ScheduleBlockchain = require('./schedule-blockchain');
const ScheduleFile = require('./schedule-file');
const ScheduleUser = require('./schedule-user');


function sendMessage(sqs, urlQueue, value) {
  return new Promise((resolve, reject) => {
    var params = {
      MessageBody: value,
      QueueUrl: urlQueue
    };
    sqs.sendMessage(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data.MessageId);
      }
    })
  })
}

class Schedule {

  static sendEmailSignNotFinished(email) {
    var validator = require('validator');
    var count = 0;
    return UserModel.signNotFinished()
      .then(users => {
        async.eachSeries(users, function (row, next) {
          setTimeout(function () {
            if (row && row.email && validator.isEmail(row.email.toString())) {
              const user = { user_name: row.name, profile_email: row.email };
              const NotificationService = require('./notification');
              NotificationService.sendMessage('SignNotFinished', user, null, null)
                .then(success => {
                  console.log(user.profile_email)
                })
            }
            next();
            count = count + 1; // don't forget to execute the callback!
          }, 30);
        }, function (err) {
          console.log(count)
        });
      })
  }
}


var func = {
  "startFileProcess": () => { return ScheduleFile.startFileProcess() },
  "startFileProcessByPetition": (petitionId) => { return ScheduleFile.startFileProcessByPetition(petitionId) },
  "startFileProcessByRange": (startRange, finishRange) => { return ScheduleFile.startFileProcessByRange(startRange, finishRange) },
  "startGenerateBatch": () => { return ScheduleBatch.startGenerateBatch() },
  startPetitionBlockchainVerify: () =>
    ScheduleBlockchain.startPetitionBlockchainVerify()
      .then(() => {
        logger.info("Petition blockchain verify finished");
        process.exit(0);
      })
      .catch(error => {
        logger.error(error);
        process.exit(1);
      }),
  startBatchBlockchainVerify: () =>
    ScheduleBlockchain.startBatchBlockchainVerify()
      .then(() => {
        logger.info("Batch blockchain verify finished");
        process.exit(0);
      })
      .catch(error => {
        logger.error(error);
        process.exit(1);
      }),
  starImportUserMudamos: () => ScheduleUser.starImportUserMudamos()
    .then(() => {
      logger.info("starImportUserMudamos finished");
      process.exit(0);
    })
    .catch(error => {
      logger.error(error);
      process.exit(1);
    }),
  starBlackList: () => ScheduleBlackList.starBlackList()
    .then(() => {
      logger.info("starBlackList finished");
      process.exit(0);
    })
    .catch(error => {
      logger.error(error);
      process.exit(1);
    }),
  sendEmailSignNotFinished: () => Schedule.sendEmailSignNotFinished()
    .then(() => {
      logger.info("sendEmailSignNotFinished finished");
      process.exit(0);
    })
    .catch(error => {
      logger.error(error);
      process.exit(1);
    }),
}

function exitHandler(options, err) {
  var connection = new Connection();
  var pool = connection.getPool();
  pool.end();
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

process.argv.forEach(function (val, index, array) {
  if (appConfig("PDF_SCHEDULE")) {
    if (val.indexOf('function') > -1) {
      var _val = val.split('=');
      func[_val[1].toString()](_val[2] || null);
    }
  }
});

if (appConfig("SCRIPT_TIMEOUT")) {
  setTimeout(() => {
    logger.error(`[FORCE SCRIPT SHUTDOWN] Failed to terminate script execution - ${process.argv[2]}`);
    process.exit(1);
  }, parseInt(appConfig("SCRIPT_TIMEOUT"), 10) * 60 * 1000)
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));
