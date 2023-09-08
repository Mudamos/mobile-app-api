"use strict";

const { UserProfileJoinTable } = require("../models");
const tables = require("../tables");
const { rejectIfFalsy } = require("../utils");

const deserializeUserProfile = UserProfileJoinTable;

const create = ({ usersProfilesTable }) => (attrs, { transaction } = {}) =>
  usersProfilesTable
    .create(attrs, { transaction })
    .then(deserializeUserProfile);

const findById = ({ usersProfilesTable }) => (id, { transaction } = {}) =>
  usersProfilesTable
    .findByPk(id, { transaction })
    .then(rejectIfFalsy())
    .then(deserializeUserProfile);

module.exports = sequelize => {
  return {
    create: create(tables(sequelize)),
    findById: findById(tables(sequelize)),
    transaction: callback => sequelize.transaction(callback),
  };
};
