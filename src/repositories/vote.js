"use strict";

const {
  map,
  prop,
} = require("ramda");

const queryBuilder = require("../db/query-builder");
const tables = require("../tables");

const { Vote } = require("../models");

const { rejectIfFalsy } = require("../utils");

const deserializeVote = vote => Vote({
  id: vote.id ? String(vote.id) : null,
  cityId: vote.cityId ? String(vote.cityId) : null,
  petitionId: vote.petitionId ? String(vote.petitionId) : null,
  cityName: vote.cityName,
  createdAt: vote.createdAt,
  district: vote.district,
  geolocation: vote.geolocation,
  message: vote.message,
  mobileNumber: vote.mobileNumber,
  signature: vote.signature,
  state: vote.state,
  status: vote.status,
  uf: vote.uf,
  voteCardId: vote.voteCardId,
  walletKey: vote.walletKey,
});

const allVotesByPetitionIds = ({ votesTable }) => ({ petitionIds, uf, cityId }) => {
  const replacements = [petitionIds];
  let sql = `
    SELECT
      v.id,
      v.cityName,
      v.district,
      v.message,
      v.signature,
      v.state,
      v.uf
    FROM
      vote v
    JOIN user u ON u.voteIdCard = v.voteIdCard
    WHERE
      v.petitionId IN (?)
  `;

  if (cityId) {
    replacements.push(cityId);
    sql += " AND v.cityId = ?";
  }

  if (uf) {
    replacements.push(uf);
    sql += " AND v.uf = ?";
  }

  sql += `
    ORDER BY
      v.state ASC,
      v.uf ASC,
      v.cityName ASC,
      v.district collate utf8_bin ASC,
      u.name ASC
  `;

  // Do not deserialize, the ideia here is being memory wise performant
  return votesTable
    .sequelize
    .query(sql, { replacements, type: votesTable.sequelize.QueryTypes.SELECT });
};

const cityVotesByPetitionIds = tables => ({ petitionIds, cityId }) =>
  allVotesByPetitionIds(tables)({ petitionIds, cityId });

const stateVotesByPetitionIds = tables => ({ petitionIds, uf }) =>
  allVotesByPetitionIds(tables)({ petitionIds, uf });

const findCityIdsByPetitionIds = ({ votesTable }) => petitionIds => {
  const sql = `
    SELECT
      DISTINCT(cityId)
    FROM vote
    WHERE petitionId IN (?)
  `;

  const replacements = [petitionIds];
  return votesTable
    .sequelize
    .query(sql, { replacements, type: votesTable.sequelize.QueryTypes.SELECT })
    .then(map(prop("cityId")));
};

const findUfsByPetitionIds = ({ votesTable }) => petitionIds => {
  const sql = `
    SELECT
      DISTINCT(uf)
    FROM vote
    WHERE petitionId IN (?)
  `;

  const replacements = [petitionIds];
  return votesTable
    .sequelize
    .query(sql, { replacements, type: votesTable.sequelize.QueryTypes.SELECT })
    .then(map(prop("uf")));
};

const findAllBySignatures = ({ votesTable }) => signatures => {
  const sql = queryBuilder("vote")
    .select("id", "signature")
    .whereIn("signature", signatures)
    .toString();

  return votesTable
    .sequelize
    .query(sql, { type: votesTable.sequelize.QueryTypes.SELECT });
};

const findById = ({ votesTable }) => id =>
  votesTable
    .findByPk(id)
    .then(rejectIfFalsy())
    .then(deserializeVote);

module.exports = sequelize => {
  const allTables = tables(sequelize);

  return {
    allVotesByPetitionIds: allVotesByPetitionIds(allTables),
    cityVotesByPetitionIds: cityVotesByPetitionIds(allTables),
    findById: findById(allTables),
    findCityIdsByPetitionIds: findCityIdsByPetitionIds(allTables),
    findUfsByPetitionIds: findUfsByPetitionIds(allTables),
    findAllBySignatures: findAllBySignatures(allTables),
    stateVotesByPetitionIds: stateVotesByPetitionIds(allTables),
  };
};
