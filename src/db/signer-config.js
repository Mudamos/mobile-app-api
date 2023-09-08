"use strict";

/*
 * Database configure mainly used by sequelize CLI (eg. migrations)
 */
require("dotenv").load({ silent: true });

const config = require("../../config")();

const env = process.env.NODE_ENV || "development";
const options = require("./database-options")(config, { database: "signer" });

module.exports = {
  [env]: options,
};
