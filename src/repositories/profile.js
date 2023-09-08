"use strict";

const { Profile } = require("../models");
const tables = require("../tables");
const { rejectIfFalsy } = require("../utils");

const deserializeProfile = Profile;

const create = ({ profilesTable }) => (attrs, { transaction } = {}) =>
  profilesTable
    .create(attrs, { transaction })
    .then(deserializeProfile);

const findById = ({ profilesTable }) => (id, { transaction } = {}) =>
  profilesTable
    .findByPk(id, { transaction })
    .then(rejectIfFalsy())
    .then(deserializeProfile);

module.exports = sequelize => {
  return {
    create: create(tables(sequelize)),
    findById: findById(tables(sequelize)),
    transaction: callback => sequelize.transaction(callback),
  };
};
