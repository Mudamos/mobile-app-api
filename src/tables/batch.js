"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("batch", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cityId: {
      type: Sequelize.INTEGER,
    },
    petitionId: {
      type: Sequelize.INTEGER,
    },
    anonymisedSignature: {
      type: Sequelize.STRING,
      field: "signatureAnonymised",
    },
    blockchainDate: {
      type: Sequelize.DATE,
      field: "blockStamp",
    },
    key: {
      type: Sequelize.STRING,
      field: "file",
    },
    signature: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.BOOLEAN,
    },
    transactionDate: {
      type: Sequelize.DATE,
      field: "txStamp",
    },
    transactionId: {
      type: Sequelize.STRING,
      field: "txId",
    },
    uf: {
      type: Sequelize.STRING(2),
    },
  }, {
    tableName: "batch",
    timestamps: false,
  });
