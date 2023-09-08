"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("petition", {
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
      field: "idPetition",
    },
    versionId: {
      type: Sequelize.INTEGER,
      field: "idVersion",
    },
    createdAt: {
      type: Sequelize.DATE,
      field: "create",
    },
    name: {
      type: Sequelize.STRING,
    },
    pageUrl: {
      type: Sequelize.STRING,
    },
    pdfUrl: {
      type: Sequelize.STRING,
      field: "url",
    },
    scopeCoverage: {
      type: Sequelize.STRING,
    },
    sha: {
      type: Sequelize.STRING,
      field: "digSig",
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
    tableName: "petition",
    timestamps: false,
  });
