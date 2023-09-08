"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("profile", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING(80),
    },
    type: {
      type: Sequelize.STRING(10),
      allowNull: false,
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      field: "create",
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    profileId: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    picture: {
      type: Sequelize.STRING(200),
      allowNull: false,
    },
    isAvatar: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    pictureUpdatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  }, {
    tableName: "profile",
    timestamps: false,
  });
