"use strict";

const { mergeAll } = require("ramda");

module.exports = mergeAll([
  require("./pdf-signature-creator"),
  require("./plip-mobile-validation-sender"),
  require("./plip-mobile-validation-verifier"),
  require("./requires-mobile-validation"),
  require("./signature-goals-calculator"),
]);
