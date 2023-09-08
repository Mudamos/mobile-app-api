"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.addIndex("vote", {
      fields: ["CityName", "Uf"],
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeIndex("vote", ["CityName", "Uf"]),
};
