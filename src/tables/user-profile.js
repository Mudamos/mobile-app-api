"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("userProfile", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    profileId: {
      type: Sequelize.INTEGER,
    },
  }, {
    tableName: "user_profile",
    timestamps: false,
  });
