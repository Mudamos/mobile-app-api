"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("petitionMobile", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    petitionId: {
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    phone: {
      type: Sequelize.STRING,
    },
    isValidated: {
      type: Sequelize.BOOLEAN,
    },
    deviceUniqueId: {
      type: Sequelize.STRING,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  }, {
    tableName: "petition_mobile",
  });
