"use strict";

const uuidv4 = require("uuid/v4");

module.exports = (generator = () => uuidv4()) => (req, res, next) => {
  req.id = generator();
  next();
};
