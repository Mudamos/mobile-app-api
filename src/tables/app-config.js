"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("config", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      field: "keyName",
    },
    value: {
      type: Sequelize.STRING,
    },
  }, {
    tableName: "config",
    timestamps: false,
  });
