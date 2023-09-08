"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("signed_messages", "integratorId", {
      type: Sequelize.STRING,
      allowNull: false,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("signed_messages", "integratorId"),
};
