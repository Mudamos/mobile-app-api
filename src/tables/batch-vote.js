"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("batchVote", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    batchId: {
      type: Sequelize.INTEGER,
    },
    voteId: {
      type: Sequelize.INTEGER,
    },
    signature: {
      type: Sequelize.STRING,
    },
  }, {
    tableName: "batch_vote",
    timestamps: false,
  });
