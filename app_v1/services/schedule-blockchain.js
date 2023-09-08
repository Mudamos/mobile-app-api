const nconf = require('nconf');
const path = require('path');
const _ = require('lodash');
const config = require('nconf');
const ScheduleHelper = require('../../libs/helpers/schedule');
const AWS = require('aws-sdk');
const fs = require('fs');

require('dotenv').load({ silent: true });

nconf
  .use('memory')
  .argv()
  .env();

const appConfig = require("../../config")();
const { logCreator } = require("../../src/services");
const { logger } = logCreator(appConfig);

const PetitionModel = require('../models/petition/petition');
const BlockchainModel = require('../models/blockchain/blockchain');
const BatchModel = require('../models/vote/batch')
const TraceModel = require('../../libs/models/log/trace');
const VoteModel = require('../models/vote/vote');

const {
  originalMyIsDocumentStatusSuccess,
  originalMyIsDocumentStatusNonexistent,
} = require("../../src/utils");

class ScheduleBlockchain {

  static startPetitionBlockchainVerify() {
    logger.info("startPetitionBlockchainVerify");

    const sqs = new AWS.SQS({
      apiVersion: "2012-11-05",
      region: config.get("AWS_REGION_SQS"),
      accessKeyId: config.get("AWS_ACCESSKEY_ID"),
      secretAccessKey: config.get("AWS_ACCESSKEY_SECRET"),
    });

    return PetitionModel.findAll()
      .then(petitions => Promise.all(petitions.map(petition =>
        BlockchainModel.status(petition.sha)
          .then(blockchainInfo => {
            if (originalMyIsDocumentStatusNonexistent(blockchainInfo)) {
              logger.info("[startPetitionBlockchainVerify] Registering Petition: ", petition.id);
              return BlockchainModel.register(petition.sha);
            }

            if (!originalMyIsDocumentStatusSuccess(blockchainInfo)) {
              logger.info("[startPetitionBlockchainVerify] Petition not confirmed: ", petition.id, blockchainInfo);
              return;
            }

            logger.info("[startPetitionBlockchainVerify] Petition confirmed: ", petition.id, blockchainInfo);
            // This should be in a transaction
            return PetitionModel.update({
              tx_id: blockchainInfo.data.transaction,
              tx_stamp: blockchainInfo.data.txstamp,
              block_stamp: blockchainInfo.data.blockstamp,
              status: 1,
              id: petition.id,
            })
            .then(() => ScheduleHelper.getQueue(sqs, config.get("AWS_SQS_PETITION")))
            .then(urlQueue => ScheduleHelper.sendMessage(sqs, urlQueue, `{"id":${parseInt(petition.id_version)}}`))
            .then(messageId => TraceModel.log(
              "PROCESS-PETITION-SQS-SEND",
              `MessageId SQS : ${JSON.stringify(messageId)} PetitionId : ${petition.id_version}`,
              "",
              false
            ))
          })
      )));
  }

  static async startBatchBlockchainVerify() {
    logger.info("startBatchBlockchainVerify");

    const batches = await BatchModel.findAll();
    return Promise.all(batches.map(batch => BlockchainModel.status(batch.signature)
      .then(async blockchainInfo => {
        logger.info("Batch:", batch.id, "response:", blockchainInfo);
        if (!originalMyIsDocumentStatusSuccess(blockchainInfo)) return;

        logger.info("Batch:", batch.id, "is confirmed, updating");
        const { id } = await BatchModel.update({
          tx_id: blockchainInfo.data.transaction,
          tx_stamp: blockchainInfo.data.txstamp,
          block_stamp: blockchainInfo.data.blockstamp,
          status: 1,
          id: batch.id,
        });

        logger.info("Batch:", batch.id, "updated. Will updateBlockchainProcess");

        await VoteModel.updateBlockchainProcess(id);
        logger.info("Batch:", batch.id, "updateBlockchainProcess done");

        const pathFile = path.resolve(__dirname, `${config.get("PDF_FOLDER")}${batch.file}`).replace(/\/anonymised/, "");
        const pathFileAnonymised = path.resolve(__dirname, `${config.get("PDF_FOLDER")}${batch.file}`);

        if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
        if (fs.existsSync(pathFileAnonymised)) fs.unlinkSync(pathFileAnonymised);

        await TraceModel.log("PROCESS-BATCH-BLOCKCHAIN", `Batch Id  : ${JSON.stringify(batch)}`, "", false).catch(() => {
          logger.info("Failed to trace log:", batch.id);
        });

        return { success: true, batchId: batch.id };
      })
      .catch(error => {
        logger.info("Failed batch:", batch.id, "message:", error.message, error);
        return { success: false, batchId: batch.id };
      })
    ))
      .then(results => {
        logger.info("startBatchBlockchainVerify results: ", results, "size:", results.length);
        logger.info("Will clean empty folders");

        ScheduleHelper.cleanEmptyFoldersRecursively(path.resolve(__dirname, config.get("PDF_FOLDER")));
        logger.info("Cleaned empty folders");
      });
  }
}

module.exports = ScheduleBlockchain;