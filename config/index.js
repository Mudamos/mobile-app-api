"use strict";

const {
  always,
  complement,
  is,
  isNil,
  find,
  test,
} = require("ramda");

const isNotNil = complement(isNil);
const isBoolean = test(/^true|false$/i);
const isString = is(String);
const isFunction = is(Function);

const config = config => name => {
  if (name in config) {
    const option = config[name];

    return isString(option) && isBoolean(option)
      ? test(/^true$/i, option)
      : option;
  }

  return null;
};

const defaultConfig = {
  APPLE_SIGN_IN_IGNORE_EXPIRATION: false,
  DB_MULTIPLE_STATEMENTS_ENABLED: false,
  SHOW_LOG_COLOR: false,
  LOG_LEVEL: "debug",
  DB_LOGGING: false,
  DB_PORT: 3306,
  DB_POOL_ACQUIRE: 60000,
  DB_POOL_IDLE: 10000,
  REQUEST_TIMEOUT: 45000, // ms
  SCRIPT_TIMEOUT: 0,
};

module.exports = (configuration = {}) => (name, defaultValue) => {
  const runtimeDefaultValue = isFunction(defaultValue) ? defaultValue : always(defaultValue);

  /* Priority:
   * - Injection
   * - Env var
   * - Default config
   * - Runtime default value (function or value)
   */
  const value = find(isNotNil, [
    config(configuration),
    config(process.env),
    config(defaultConfig),
    runtimeDefaultValue,
  ].map(config => config(name)));

  if (isNotNil(value)) {
    return value;
  } else {
    throw new Error(`Env var ${name} not defined`);
  }
};
