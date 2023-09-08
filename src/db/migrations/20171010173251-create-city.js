"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("city", {
      Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Uf: {
        type: Sequelize.STRING(2),
      },
    }, {
      charset: "utf8",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.dropTable("city"),
};

