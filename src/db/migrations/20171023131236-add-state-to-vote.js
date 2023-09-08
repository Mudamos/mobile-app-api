"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("vote", "State", {
      type: Sequelize.STRING,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("vote", "State"),
};
