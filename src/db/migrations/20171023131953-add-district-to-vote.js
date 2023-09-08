"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("vote", "District", {
      type: Sequelize.STRING,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("vote", "District"),
};
