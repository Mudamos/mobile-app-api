"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("city", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    uf: {
      type: Sequelize.STRING(2),
    },
  }, {
    tableName: "city",
    timestamps: false,
  });
