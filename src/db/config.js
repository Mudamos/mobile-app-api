"use strict";

/*
 * Database configure mainly used by sequelize CLI (eg. migrations)
 */
require("dotenv").load({ silent: true });

const config = require("../../config")({
  // Migrations require multiple statements (eg. stored procedure)
  DB_MULTIPLE_STATEMENTS_ENABLED: true,
});

const env = process.env.NODE_ENV || "development";
const options = require("./database-options")(config);

module.exports = {
  [env]: options,
};
