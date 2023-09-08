"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("batch", "CityId", {
      type: Sequelize.INTEGER,
      references:  {
        model: "city",
        key: "id",
      },
      onDelete: "RESTRICT",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("batch", "CityId"),
};
