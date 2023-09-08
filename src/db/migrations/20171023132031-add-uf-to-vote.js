"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("vote", "Uf", {
      type: Sequelize.STRING(2),
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("vote", "Uf"),
};
