"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize =>
  sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    birthday: {
      type: Sequelize.DATE,
    },
    cityName: {
      type: Sequelize.STRING,
      field: "city",
    },
    cpf: {
      type: Sequelize.STRING,
    },
    district: {
      type: Sequelize.STRING,
    },
    hasAcceptedTerms: {
      type: Sequelize.BOOLEAN,
      field: "termsAccepted",
    },
    lat: {
      type: Sequelize.DECIMAL(17, 14),
    },
    lng: {
      type: Sequelize.DECIMAL(17, 14),
    },
    name: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    uf: {
      type: Sequelize.STRING(2),
    },
    voteCardId: {
      type: Sequelize.STRING,
      field: "voteIdCard",
    },
    zipCode: {
      type: Sequelize.STRING,
      field: "zipcode",
    },
  }, {
    tableName: "user",
    timestamps: false,
  });
