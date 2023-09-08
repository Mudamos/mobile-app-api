"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
  queryInterface.addColumn("user", "VoteCityId", {
    type: Sequelize.INTEGER,
    references: {
      model: "city",
      key: "id",
    },
    onDelete: "SET NULL",
    allowNull: true,
  }),

  down: (queryInterface, _Sequelize) =>
  queryInterface.removeColumn("user", "VoteCityId"),
};
