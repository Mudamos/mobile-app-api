"use strict";

const sequelize = require("sequelize");
const { fn } = sequelize;

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("profile", "PictureUpdatedAt", {
      type: Sequelize.DATE,
      defaultValue: fn("NOW"),
      allowNull: false,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("profile", "PictureUpdatedAt"),
};
