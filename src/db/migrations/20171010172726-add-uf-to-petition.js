"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("petition", "Uf", {
      type: Sequelize.STRING(2),
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("petition", "Uf"),
};
