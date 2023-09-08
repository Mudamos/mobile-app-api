"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("petition", "ScopeCoverage", {
      type: Sequelize.STRING,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("petition", "ScopeCoverage"),
};
