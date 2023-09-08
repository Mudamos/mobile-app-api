"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("city", "otherNames", {
      type: Sequelize.TEXT,
      allowNull: true,
    }),
  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("city", "otherNames"),
};
