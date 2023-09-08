"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.addIndex("vote", {
      fields: ["CityName", "PetitionId", "Uf"],
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeIndex("vote", ["CityName", "PetitionId", "Uf"]),
};
