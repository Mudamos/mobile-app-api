"use strict";

const { pickAll } = require("ramda");

module.exports = pickAll([
  "versionId",
  "petitionId",
  "requiresMobileValidation",
]);
