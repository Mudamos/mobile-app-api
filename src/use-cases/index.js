"use strict";

const { mergeAll } = require("ramda");

module.exports = mergeAll([
  require("./fb-limited-auth"),
  require("./message-sign"),
  require("./petition"),
  require("./notification"),
  require("./s3-file-mover"),
  require("./user"),
  require("./vote"),
]);
