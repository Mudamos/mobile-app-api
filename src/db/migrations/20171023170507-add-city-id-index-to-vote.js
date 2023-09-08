"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.addIndex("vote", {
      fields: ["CityId"],
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeIndex("vote", ["CityId"]),
};
