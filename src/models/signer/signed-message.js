"use strict";

const { pickAll } = require("ramda");

module.exports = pickAll([
  "id",
  "userId",
  "integratorId",
  "content",
  "createdAt",
]);
