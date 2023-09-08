"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("petition_mobile", "deviceUniqueId", {
      type: Sequelize.STRING,
      allowNull: false,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("petition_mobile", "deviceUniqueId"),
};
