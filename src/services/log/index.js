"use strict";

const winston = require("winston");
const winstonStream = require("winston-stream");

module.exports = config => {
  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: config("LOG_LEVEL"),
        colorize: config("SHOW_LOG_COLOR"),
        timestamp: true,
      }),
    ],
  });

  const stream = winstonStream(logger, config("LOG_LEVEL"));

  return {
    logger,
    stream,
  };
};

