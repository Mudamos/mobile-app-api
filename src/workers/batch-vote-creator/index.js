"use strict";

const {
  pick,
} = require("ramda");

const parse = JSON.parse;
const messageAttributes = pick(["MessageId", "Body"]);

module.exports = ({ logger = console, batchVoteCreator }) => async (message, done) => {
  logger.info("Processing batch vote creation for: ", messageAttributes(message));

  const content = parse(message.Body);
  await batchVoteCreator({
    anonymisedPdfKey: content.anonymisedPdfKey,
    batchKey: content.batchKey,
    cityId: content.cityId,
    normalPdfKey: content.normalPdfKey,
    petitionId: content.petitionId,
    uf: content.uf,
  });

  logger.info("Done processing batch vote:", content);
  done();
};
