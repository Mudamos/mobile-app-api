"use strict";

const { always, head } = require("ramda");

const tables = require("../tables");
const { PetitionMobile } = require("../models");
const { rejectIfFalsy } = require("../utils");

const deserializePetitionMobile = PetitionMobile;

const findByUserIdAndPetitionId = ({ petitionMobileTable }) => ({ userId, petitionId }, { transaction } = {}) =>
  petitionMobileTable
    .findAll({
      transaction,
      limit: 1,
      where: { userId, petitionId },
    })
    .then(head)
    .then(rejectIfFalsy())
    .then(deserializePetitionMobile);

const create = ({ petitionMobileTable }) => ({ deviceUniqueId, isValidated, phone, petitionId, userId }, { transaction } = {}) =>
  petitionMobileTable
    .create({ deviceUniqueId, isValidated, phone, petitionId, userId }, { transaction })
    .then(deserializePetitionMobile);

const updateById = ({ petitionMobileTable }) => (id, attrs, { transaction } = {}) =>
  petitionMobileTable
    .update(attrs, { transaction, where: { id }})
    .then(always(true));

const findLastValidatedByUserId = ({ petitionMobileTable }) => userId =>
  petitionMobileTable
    .findAll({
      limit: 1,
      where: { isValidated: true, userId },
      order: [["createdAt", "DESC"]],
    })
    .then(head)
    .then(data => data ? deserializePetitionMobile(data) : null);

module.exports = sequelize => ({
  create: create(tables(sequelize)),
  findByUserIdAndPetitionId: findByUserIdAndPetitionId(tables(sequelize)),
  findLastValidatedByUserId: findLastValidatedByUserId(tables(sequelize)),
  transaction: callback => sequelize.transaction(callback),
  updateById: updateById(tables(sequelize)),
});
