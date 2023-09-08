"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("batch", "Uf", {
      type: Sequelize.STRING(2),
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("batch", "Uf"),
};
