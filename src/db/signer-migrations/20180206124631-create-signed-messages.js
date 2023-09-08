"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("signed_messages", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING(510),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }, {
      charset: "utf8",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.dropTable("signed_messages"),
};
