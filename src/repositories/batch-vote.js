"use strict";

const {
  map,
  take,
} = require("ramda");

const Sequelize = require("sequelize");
const tables = require("../tables");
const { BatchVote, PaginatedResult } = require("../models");

const { rejectIfFalsy } = require("../utils");

const deserializeBatchVote = batchVote => BatchVote({
  id: batchVote.id ? String(batchVote.id) : null,
  batchId: batchVote.batchId ? String(batchVote.batchId) : null,
  voteId: batchVote.voteId ? String(batchVote.voteId) : null,
  signature: batchVote.signature,
});

const create = ({ batchVotesTable }) => ({
  batchId,
  voteId,
  signature,
  transaction,
}) =>
  batchVotesTable
    .create({
      batchId,
      voteId,
      signature,
    }, { transaction })
    .then(deserializeBatchVote);

const findById = ({ batchVotesTable }) => id =>
  batchVotesTable
    .findByPk(id)
    .then(rejectIfFalsy())
    .then(deserializeBatchVote);

const findAllByBatchId = ({ batchVotesTable }) => async ({ batchId, limit = 10, after }) => {
  const order = [
    ["id", "ASC"],
  ];

  const where = {
    batchId,
  };

  if (after) where.id = { [Sequelize.Op.gt]: after };

  const batchVotes = await batchVotesTable
    .findAll({
      where,
      limit: limit + 1,
      order,
    })
    .then(map(deserializeBatchVote));

  return new PaginatedResult({
    results: take(limit, batchVotes),
    hasMore: batchVotes.length === (limit + 1),
    isForward: true,
  });
};

module.exports = sequelize => {
  return {
    create: create(tables(sequelize)),
    findById: findById(tables(sequelize)),
    findAllByBatchId: findAllByBatchId(tables(sequelize)),
  };
};
