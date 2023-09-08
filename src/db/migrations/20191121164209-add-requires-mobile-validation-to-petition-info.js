"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("petition_info", "RequiresMobileValidation", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("petition_info", "RequiresMobileValidation"),
};
