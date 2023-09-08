"use strict";

const tables = require("../../tables/signer");
const { SignedMessage } = require("../../models/signer");
const { rejectIfFalsy } = require("../../utils");

const deserializeSignedMessage = message => SignedMessage({
  id: message.id ? String(message.id) : null,
  userId: message.userId ? String(message.userId) : null,
  integratorId: message.integratorId,
  content: message.content,
  createdAt: message.createdAt,
});

const create = ({ signedMessagesTable }) => ({ content, userId, integratorId }) =>
  signedMessagesTable
    .create({ content, userId, integratorId })
    .then(deserializeSignedMessage);

const count = ({ signedMessagesTable }) => () =>
  signedMessagesTable.count();

const findById = ({ signedMessagesTable }) => (id, { transaction } = {}) =>
  signedMessagesTable
    .findByPk(id, { transaction })
    .then(rejectIfFalsy())
    .then(deserializeSignedMessage);

module.exports = sequelize => ({
  create: create(tables(sequelize)),
  count: count(tables(sequelize)),
  findById: findById(tables(sequelize)),
});
