"use strict";

const {
  head,
} = require("ramda");
const tables = require("../tables");
const { AppConfig } = require("../models");

const { rejectIfFalsy } = require("../utils");

const deserializeAppConfig = config => AppConfig({
  id: config.id,
  name: config.name,
  value: config.value,
});

const findByName = ({ appConfigsTable }) => name =>
  appConfigsTable
    .findAll({
      limit: 1,
      where: { name },
    })
    .then(head)
    .then(rejectIfFalsy())
    .then(deserializeAppConfig);

module.exports = sequelize => {
  return {
    findByName: findByName(tables(sequelize)),
  };
};
