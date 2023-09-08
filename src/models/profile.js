"use strict";

const { pickAll } = require("ramda");

module.exports = pickAll([
  "id",
  "email",
  "type",
  "status",
  "createdAt",
  "profileId",
  "picture",
  "isAvatar",
  "pictureUpdatedAt",
]);
