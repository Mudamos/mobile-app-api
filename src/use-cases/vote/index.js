"use strict";

const { mergeAll } = require("ramda");

module.exports = mergeAll([
  require("./batch-vote-creator"),
]);
