"use strict";

const {
  always,
  head,
  map,
  pipe,
  propEq,
} = require("ramda");

const tables = require("../tables");
const { Petition } = require("../models");

const { rejectIfFalsy } = require("../utils");

const deserializePetition = petition => new Petition({
  id: petition.id,
  cityId: petition.cityId,
  petitionId: petition.petitionId,
  versionId: petition.versionId,
  createdAt: petition.createdAt,
  name: petition.name,
  pageUrl: petition.pageUrl,
  pdfUrl: petition.pdfUrl,
  scopeCoverage: petition.scopeCoverage,
  sha: petition.sha,
  status: petition.status,
  transactionDate: petition.transactionDate,
  transactionId: petition.transactionId,
  uf: petition.uf,
});

const findPetitionById = ({ petitionsTable }) => id =>
  petitionsTable
    .findByPk(id)
    .then(rejectIfFalsy())
    .then(deserializePetition);

const findPetitionByVersionId = ({ petitionsTable }) => versionId =>
  petitionsTable
    .findAll({
      limit: 1,
      where: { versionId },
    })
    .then(head)
    .then(rejectIfFalsy())
    .then(deserializePetition);

const findAllByPetitionId = ({ petitionsTable }) => petitionId =>
  petitionsTable
    .findAll({
      where: {
        petitionId,
      },
      order: [["versionId", "ASC"]],
    })
    .then(map(deserializePetition));

const isFirstVersionById = ({ petitionsTable }) => async id => {
  const petition = await findPetitionById({ petitionsTable })(id);
  const petitions = await findAllByPetitionId({ petitionsTable })(petition.petitionId);

  return pipe(head, propEq("id", id))(petitions);
};

const updateAllByPetitionId = ({ petitionsTable }) => ({ petitionId, transaction }) => attrs =>
  petitionsTable
    .update(attrs, { transaction, where: { petitionId }})
    .then(always(true));

const findLatestByPetitionId = ({ petitionsTable }) => petitionId =>
  petitionsTable
    .findOne({
      where: {
        petitionId,
      },
      order: [["versionId", "DESC"]],
      limit: 1,
    })
    .then(deserializePetition);

module.exports = sequelize => {
  return {
    findAllByPetitionId: findAllByPetitionId(tables(sequelize)),
    findLatestByPetitionId: findLatestByPetitionId(tables(sequelize)),
    findById: findPetitionById(tables(sequelize)),
    findByVersionId: findPetitionByVersionId(tables(sequelize)),
    isFirstVersionById: isFirstVersionById(tables(sequelize)),
    updateAllLocationByPetitionId: ({ petitionId, transaction }) => ({ scopeCoverage, cityId, uf }) =>
      updateAllByPetitionId(tables(sequelize))({ transaction, petitionId })({ scopeCoverage, cityId, uf }),
  };
};

