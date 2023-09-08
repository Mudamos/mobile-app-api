"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn("vote", "Latitude", {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    }).then(() =>
      queryInterface.addColumn("vote", "Longitude", {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      })
    ).then(() =>
      queryInterface.addColumn("vote", "DeviceId", {
        type: Sequelize.STRING,
        allowNull: true,
      })
    ).then(() =>
      queryInterface.addColumn("vote", "DeviceUniqueId", {
        type: Sequelize.STRING,
        allowNull: true,
      })
    ).then(() =>
      queryInterface.addColumn("vote", "AppVersion", {
        type: Sequelize.STRING,
        allowNull: true,
      })
    ),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeColumn("vote", "Latitude")
      .then(() => queryInterface.removeColumn("vote", "Longitude"))
      .then(() => queryInterface.removeColumn("vote", "DeviceId"))
      .then(() => queryInterface.removeColumn("vote", "DeviceUniqueId"))
      .then(() => queryInterface.removeColumn("vote", "AppVersion")),
};
