"use strict";

const {
  pick,
} = require("ramda");

const parse = JSON.parse;
const messageAttributes = pick(["MessageId", "Body"]);

module.exports = ({ logger = console, pdfCreator }) => async (message, done) => {
  logger.info("Processing pdf creation for: ", messageAttributes(message));

  const content = parse(message.Body);
  await pdfCreator({
    cityId: content.cityId,
    petitionId: content.id,
    uf: content.uf,
  });

  logger.info("Done processing petition id:", content.id);
  done();
};
