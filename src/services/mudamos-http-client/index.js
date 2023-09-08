"use strict";

const request = require("superagent-promise")(require("superagent"), Promise);
const prefix = require("superagent-prefix");

const {
  prop,
} = require("ramda");

const { camelizeKeys } = require("humps");

const validateResponse = res => {
  if (!res.ok) return Promise.reject(res);

  return res.body && res.body.status === "success"
    ? camelizeKeys(res.body.data)
    : Promise.reject(res.body);
}

module.exports = config => {
  const apiUrl = config("MUDAMOS_API_URL");

  const client = ({ url = apiUrl, version = "v2" } = {}) => (...args) =>
    request(...args)
      .use(prefix(`${url}/${version}`));

  return {
    listPlips: ({ scope = "all", limit } = {}) =>
      client()("GET", "/plips")
        .query({ scope, limit })
        .then(validateResponse)
        .then(prop("plips")),
  };
};
