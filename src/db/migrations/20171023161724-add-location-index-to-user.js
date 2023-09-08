"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.addIndex("user", {
      fields: ["City", "Uf"],
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeIndex("user", ["City", "Uf"]),
};
