"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("petition", "CityId", {
      type: Sequelize.INTEGER,
      references:  {
        model: "city",
        key: "id",
      },
      onDelete: "CASCADE",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("petition", "CityId"),
};

