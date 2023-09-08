"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("batch", "PetitionId", {
      type: Sequelize.INTEGER,
      references:  {
        model: "petition",
        key: "id",
      },
      onDelete: "RESTRICT",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("batch", "PetitionId"),
};
