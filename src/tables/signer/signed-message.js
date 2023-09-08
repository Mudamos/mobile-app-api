"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("signed_messages", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    integratorId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    content: {
      type: Sequelize.STRING(510),
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  }, {
    timestamps: true,
    updatedAt: false,
  });
