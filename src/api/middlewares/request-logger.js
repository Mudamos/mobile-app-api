"use strict";

const morgan = require("morgan");
const { propOr } = require("ramda");

const defaultFormat = ":date[iso] :id :method :url :status :response-time ms";

morgan.token("id", req => req.id);

module.exports = (config = {}) => {
  const format = propOr(defaultFormat, "format");
  return morgan(format(config), config);
};
