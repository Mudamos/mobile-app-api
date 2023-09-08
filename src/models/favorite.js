"use strict";

module.exports = favorite => ({
  id: favorite.id,
  userId: favorite.userId,
  petitionId: favorite.petitionId,
  createdAt: favorite.createdAt,
});