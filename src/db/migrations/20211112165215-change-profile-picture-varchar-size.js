"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn("profile", "Picture", {
      type: Sequelize.STRING(500),
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn("profile", "Picture", {
      type: Sequelize.STRING(200),
    }),
};
