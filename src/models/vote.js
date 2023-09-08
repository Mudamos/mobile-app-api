"use strict";

module.exports = vote => ({
  id: vote.id,
  cityId: vote.cityId,
  petitionId: vote.petitionId,
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
