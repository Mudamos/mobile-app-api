"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("favorite", {
      Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "Id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      PetitionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Create: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    }, {
      charset: "utf8",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.dropTable("favorite"),
};