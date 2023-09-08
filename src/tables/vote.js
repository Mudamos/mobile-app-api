"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("vote", {
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
    cityName: {
      type: Sequelize.STRING,
    },
    createdAt: {
      type: Sequelize.DATE,
      field: "create",
    },
    district: {
      type: Sequelize.STRING,
    },
    geolocation: {
      type: Sequelize.STRING,
      field: "geoloc",
    },
    message: {
      type: Sequelize.STRING(800),
    },
    mobileNumber: {
      type: Sequelize.STRING,
      field: "userMobileNumber",
    },
    signature: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.BOOLEAN,
    },
    uf: {
      type: Sequelize.STRING(2),
    },
    voteCardId: {
      type: Sequelize.STRING,
      field: "voteIdCard",
    },
    walletKey: {
      type: Sequelize.STRING,
      field: "walletId",
    },
  }, {
    tableName: "vote",
    timestamps: false,
  });
