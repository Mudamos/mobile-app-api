"use strict";

const { pickAll } = require("ramda");

module.exports = pickAll([
  "id",
  "petitionId",
  "userId",
  "phone",
  "isValidated",
  "deviceUniqueId",
  "createdAt",
  "updatedAt",
]);

module.exports.PETITION_MOBILE_CACHE_KEY_PREFIX = "PLIP_MOBILE_VALIDATION";
