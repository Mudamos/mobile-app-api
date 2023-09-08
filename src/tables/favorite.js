"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("favorite", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    petitionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      field: "create",
    },
  }, {
    tableName: "favorite",
    timestamps: false,
  });
