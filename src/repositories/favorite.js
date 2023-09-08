"use strict";

const tables = require("../tables");
const { Favorite } = require("../models");

const deserializeFavorite = favorite => Favorite({
  id: favorite.id,
  userId: favorite.userId,
  petitionId: favorite.petitionId,
  createdAt: favorite.createdAt,
});

const findByPetitionIdAndUser = ({ favoriteTable }) => ({ petitionId, userId }) =>
  favoriteTable
    .findOne({
      attributes: ["createdAt"],
      where: { userId, petitionId },
    })
      .then(favorite => favorite ? deserializeFavorite(favorite) : null)

module.exports = sequelize => {
  return {
    findByPetitionIdAndUser: findByPetitionIdAndUser(tables(sequelize)),
  };
};
