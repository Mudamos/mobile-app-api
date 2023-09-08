"use strict";

const crypto = require("crypto");
const AWS = require("aws-sdk");
const Bluebird = require("bluebird");
const Consumer = require("sqs-consumer");
const Producer = require("sqs-producer");

const {
  merge,
} = require("ramda");

const logCreator = require("../log");

const serialize = JSON.stringify;
const hasher = val =>
  crypto.createHash("sha256").update(val, "utf8").digest("hex");

const toMessage = json => {
  const message = serialize(json);
  return {
    id: hasher(message),
    body: message,
  };
};

const safelyHandleMessage = ({ logger }) => handleMessage => async (message, done) => {
  let called = false;
  let wrappedDone = args => {
    called = true;
    done(args);
  };

  try {
    await handleMessage(message, wrappedDone);
  } catch (e) {
    if (!called) {
      logger.error("Queue message handler error", e);
      done(e);
    }
  }
};

module.exports = config => {
  const { logger } = logCreator(config);

  const awsConfig = {
    region: config("AWS_REGION"),
    accessKeyId: config("AWS_ACCESSKEY_ID"),
    secretAccessKey: config("AWS_ACCESSKEY_SECRET"),
  };

  const consumerAwsConfig = merge(awsConfig, {
    httpOptions: {
      timeout: 25 * 1000,
    },
  });

  const producerAwsConfig = merge(awsConfig, {
    httpOptions: {
      timeout: 20 * 1000,
    },
  });

  const buildProducer = queueConfig =>
    Bluebird.promisifyAll(Producer.create(merge(producerAwsConfig, queueConfig)));

  const plipPdfCreatorProducer = buildProducer({ queueUrl: config("AWS_PETITION_PDF_SIGNATURE_CREATOR_URL") });
  const batchVoteCreatorProducer = buildProducer({ queueUrl: config("AWS_BATCH_VOTE_CREATOR_URL") });
  const moveFileProducer = buildProducer({ queueUrl: config("AWS_MOVE_S3_FILE_URL") });
  const messageSignIntegratorCallbackProducer = buildProducer({ queueUrl: config("AWS_MESSAGE_SIGN_INTEGRATOR_CALLBACK_QUEUE_URL") });

  const buildConsumer = options => {
    const consumer = Consumer.create(merge(options, {
      handleMessage: safelyHandleMessage({ logger })(options.handleMessage),
    }));

    return {
      start: () => consumer.start(),
      stop: () => consumer.stop(),
      onEmpty: fn => consumer.on("empty", fn),
      onQueueError: fn => consumer.on("error", fn),
      onStop: fn => consumer.on("stopped", fn),
      isStopped: () => consumer.stopped,
    };
  };

  return {
    enqueueBatchVoteCreation: ({
      anonymisedPdfKey,
      batchKey,
      normalPdfKey,
      petitionId,
      cityId,
      uf,
    }) =>
      batchVoteCreatorProducer.sendAsync(toMessage({
        anonymisedPdfKey,
        batchKey,
        normalPdfKey,
        petitionId,
        cityId,
        uf,
      })),

    enqueueMoveFile: ({ acl, from: { bucket: fromBucket, key: fromKey }, to: { bucket: toBucket, key: toKey } }) =>
      moveFileProducer.sendAsync(toMessage({
        acl,
        from: {
          bucket: fromBucket,
          key: fromKey,
        },
        to: {
          bucket: toBucket,
          key: toKey,
        }})),

    enqueuePdfCreation: ({ id, cityId, uf }) =>
      plipPdfCreatorProducer.sendAsync(toMessage({ id, cityId, uf })),

    enqueueMessageSignIntegratorCallback: ({ integrator, payload }) =>
      messageSignIntegratorCallbackProducer.sendAsync(toMessage({ integrator, payload })),

    messageSignIntegratorCallbackConsumer: ({ handleMessage, batchSize = 10 }) =>
      buildConsumer({
        handleMessage,
        batchSize,
        queueUrl: config("AWS_MESSAGE_SIGN_INTEGRATOR_CALLBACK_QUEUE_URL"),
        sqs: new AWS.SQS(consumerAwsConfig),
      }),

    batchVoteCreatorConsumer: ({ handleMessage, batchSize = 1 }) =>
      buildConsumer({
        handleMessage,
        batchSize,
        queueUrl: config("AWS_BATCH_VOTE_CREATOR_URL"),
        sqs: new AWS.SQS(consumerAwsConfig),
      }),

    moveFileConsumer: ({ handleMessage, batchSize = 10 }) =>
      buildConsumer({
        handleMessage,
        batchSize,
        queueUrl: config("AWS_MOVE_S3_FILE_URL"),
        sqs: new AWS.SQS(consumerAwsConfig),
      }),

    plipPdfCreatorConsumer: ({ handleMessage, batchSize = 1 }) =>
      buildConsumer({
        handleMessage,
        batchSize,
        queueUrl: config("AWS_PETITION_PDF_SIGNATURE_CREATOR_URL"),
        sqs: new AWS.SQS(consumerAwsConfig),
      }),
  };
};
