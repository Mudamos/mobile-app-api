"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.addIndex("favorite", {
      fields: ["UserId", "PetitionId"],
      unique: true,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeIndex("favorite", ["UserId", "PetitionId"]),
};
