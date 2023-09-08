"use strict";

const Sequelize = require("sequelize");
const options = require("./database-options");
const { logCreator } = require("../services");

const databases = {};

module.exports = (config, { database = "main" } = {}) => {
  if (databases[database]) return databases[database];

  const { logger } = logCreator(config);

  if (config("NODE_ENV") === "development") {
    logger.info("[app: %s][PID %d] Creating a db pool", database, process.pid);
  }

  return databases[database] = new Sequelize(options(config, { database }));
};
