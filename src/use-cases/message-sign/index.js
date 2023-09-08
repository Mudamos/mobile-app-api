"use strict";

const { mergeAll } = require("ramda");

module.exports = mergeAll([
  require("./custom-message-sign-register"),
  require("./custom-message-sign-validator"),
  require("./integrator-app-link-generator-dev-test"),
]);
