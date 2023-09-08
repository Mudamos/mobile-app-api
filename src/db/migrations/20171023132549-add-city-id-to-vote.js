"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("vote", "CityId", {
      type: Sequelize.INTEGER,
      references: {
        model: "city",
        key: "id",
      },
      onDelete: "set null",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("vote", "CityId"),
};
