"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("petition_mobile", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      petitionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "petition",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isValidated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    }, {
      charset: "utf8",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.dropTable("petition_mobile"),
};

