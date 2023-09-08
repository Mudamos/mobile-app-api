"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("vote", "CityName", {
      type: Sequelize.STRING,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("vote", "CityName"),
};
