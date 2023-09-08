"use strict";

const {
  pick,
} = require("ramda");

const parse = JSON.parse;
const messageAttributes = pick(["MessageId", "Body"]);

module.exports = ({ fileMover, logger = console }) => async (message, done) => {
  logger.info("Start moving files: ", messageAttributes(message));

  const content = parse(message.Body);
  await fileMover({
    acl: content.acl,
    from: content.from,
    to: content.to,
  });

  logger.info("Done moving files:", content);
  done();
};
