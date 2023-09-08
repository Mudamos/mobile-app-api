"use strict";

const { isMainApp, isSignerApp } = require("../utils");

module.exports = (config, { database = "main" } = {}) => {
  if (isMainApp(database)) {
    return {
      dialect: "mysql",
      host: config("DB_HOST"),
      username: config("DB_USER"),
      password: config("DB_PASS"),
      port: config("DB_PORT"),
      database: config("DB_NAME"),
      migrationStorageTableName: "sequelize_meta",
      pool: {
        min: parseInt(config("DB_POOL_MIN_CONNECTIONS"), 10),
        max: parseInt(config("DB_POOL_MAX_CONNECTIONS"), 10),
        acquire: config("DB_POOL_ACQUIRE"),
        idle: config("DB_POOL_IDLE"),
      },
      dialectOptions: {
        charset: "utf8",
        multipleStatements: config("DB_MULTIPLE_STATEMENTS_ENABLED"),
      },
      // eslint-disable-next-line no-console
      logging: config("DB_LOGGING") ? console.log : false,
    };
  } else if (isSignerApp(database)) {
    return {
      dialect: "mysql",
      host: config("SIGNER_DB_HOST"),
      username: config("SIGNER_DB_USER"),
      password: config("SIGNER_DB_PASS"),
      port: config("SIGNER_DB_PORT"),
      database: config("SIGNER_DB_NAME"),
      migrationStorageTableName: "sequelize_meta",
      pool: {
        min: parseInt(config("SIGNER_DB_POOL_MIN_CONNECTIONS"), 10),
        max: parseInt(config("SIGNER_DB_POOL_MAX_CONNECTIONS"), 10),
      },
      dialectOptions: {
        charset: "utf8",
        multipleStatements: config("DB_MULTIPLE_STATEMENTS_ENABLED"),
      },
      // eslint-disable-next-line no-console
      logging: config("DB_LOGGING") ? console.log : false,
    };
  }
};
