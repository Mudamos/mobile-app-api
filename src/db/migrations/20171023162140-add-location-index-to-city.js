"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.addIndex("city", {
      fields: ["Name", "Uf"],
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeIndex("city", ["Name", "Uf"]),
};
