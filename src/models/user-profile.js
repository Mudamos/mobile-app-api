"use strict";

const { pickAll } = require("ramda");

module.exports = profile => ({
  userId: profile.userId,
  birthday: profile.birthday,
  cityName: profile.cityName,
  cpf: profile.cpf,
  district: profile.district,
  email: profile.email,
  name: profile.name,
  profileId: profile.profileId,
  state: profile.state,
  uf: profile.uf,
  voteCardId: profile.voteCardId,
  zipCode: profile.zipCode,
});

module.exports.UserProfileJoinTable = pickAll(["id", "userId", "profileId"]);

module.exports.APPLE_PROFILE_TYPE = "apple";
