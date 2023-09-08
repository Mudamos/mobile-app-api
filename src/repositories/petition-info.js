"use strict";

const { head } = require("ramda");

const tables = require("../tables");
const { PetitionInfo } = require("../models");
const { rejectIfFalsy } = require("../utils");

const deserializePetitionInfo = PetitionInfo;

const findByVersionId = ({ petitionInfoTable }) => versionId =>
  petitionInfoTable
    .findAll({
      limit: 1,
      where: { versionId },
    })
    .then(head)
    .then(rejectIfFalsy())
    .then(deserializePetitionInfo);

module.exports = sequelize => ({
  findByVersionId: findByVersionId(tables(sequelize)),
});
