"use strict";

const {
  always,
  map,
} = require("ramda");

const tables = require("../tables");
const { Batch } = require("../models");

const { rejectIfFalsy } = require("../utils");

const deserializeBatch = batch => Batch({
  id: batch.id ? String(batch.id) : null,
  cityId: batch.cityId ? String(batch.cityId) : null,
  petitionId: batch.petitionId ? String(batch.petitionId) : null,
  anonymisedSignature: batch.anonymisedSignature,
  blockchainDate: batch.blockchainDate,
  key: batch.key,
  signature: batch.signature,
  status: batch.status,
  transactionDate: batch.transactionDate,
  transactionId: batch.transactionId,
  uf: batch.uf,
});

const create = ({ batchesTable }) => ({
  cityId,
  petitionId,
  anonymisedSignature,
  blockchainDate,
  key,
  signature,
  status = false,
  transaction,
  transactionDate,
  transactionId,
  uf,
}) =>
  batchesTable
    .create({
      cityId,
      petitionId,
      anonymisedSignature,
      blockchainDate,
      key,
      signature,
      status,
      transactionDate,
      transactionId,
      uf,
    }, { transaction })
    .then(deserializeBatch);

const findById = ({ batchesTable }) => id =>
  batchesTable
    .findByPk(id)
    .then(rejectIfFalsy())
    .then(deserializeBatch);

const findAll = ({ batchesTable }) => () =>
  batchesTable
    .findAll()
    .then(map(deserializeBatch));

const updateById = ({ batchesTable }) => ({ id, transaction }) => attrs =>
  batchesTable
    .update(attrs, { transaction, where: { id }})
    .then(always(true));

module.exports = sequelize => {
  return {
    create: create(tables(sequelize)),
    findById: findById(tables(sequelize)),
    findAll: findAll(tables(sequelize)),
    updateById: updateById(tables(sequelize)),
  };
};
