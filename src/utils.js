"use strict";

const crypto = require("crypto");

const {
  __,
  allPass,
  both,
  complement,
  compose,
  concat,
  equals,
  is,
  isEmpty,
  isNil,
  prop,
  repeat,
  take,
  test,
} = require("ramda");

const ORIGINAL_MY_KEY_DUPLICATE_DOCUMENT_ERROR_CODE = 30053;

const isBlank = value => isNil(value) || isEmpty(value) || isBlankString(value);

const isBlankString = allPass([is(String), test(/^\s*$/)]);

const isValidNumber = both(is(Number), complement(equals(NaN)));

const isInvalidNumber = complement(isValidNumber);

const isPresent = complement(isBlank);

const isString = is(String);

const promisify = (func, caller) => (...args) => new Promise((resolve, reject) => {
  const fn = caller ? func.bind(caller) : func;

  fn(...args, (err, ...result) => {
    if (err) {
      reject(err);
    } else {
      resolve(...result);
    }
  });
});

const rejectIfFalsy = (error = "Not found") => object =>
  object ? object : Promise.reject(isString(error) ? new Error(error) : error);

// in MB
const fetchUsedMemory = () => prop("heapUsed", process.memoryUsage()) / 1024 / 1024;
const forceGC = () => {
  const enabled = !!global.gc;
  if (enabled) {
    global.gc();
  }
};

const forceGCAndLog = ({ logger = console } = {}) => {
  if (!global.gc) return;

  const before = fetchUsedMemory();
  logger.info("Used memory in MB:", before);
  forceGC();

  const after = fetchUsedMemory();
  logger.info("Used memory in MB:", fetchUsedMemory(), "Freed in MB:", before - after);
};

const generateHash = (buffer, algorithm = "sha256") => {
  const hash = crypto.createHash(algorithm);
  hash.update(buffer);
  return hash.digest("hex");
};

const isDev = process.env.NODE_ENV === "development";

// eslint-disable-next-line no-console
const debug = (...args) => isDev && console.log(...args);

const isMainApp = equals("main");
const isSignerApp = equals("signer");

const isJSON = str => {
  try {
    return !!JSON.parse(str);
  } catch(_) {
    return false;
  }
};

const safelyParseJSON = str => {
  try {
    return JSON.parse(str);
  } catch(_) {
    return;
  }
};

const brazilUFToStateName = uf => {
  const mapping = {
    "ac": "Acre",
    "al": "Alagoas",
    "ap": "Amapá",
    "am": "Amazonas",
    "ba": "Bahia",
    "ce": "Ceará",
    "df": "Distrito Federal",
    "es": "Espírito Santo",
    "go": "Goiás",
    "ma": "Maranhão",
    "mt": "Mato Grosso",
    "ms": "Mato Grosso do Sul",
    "mg": "Minas Gerais",
    "pa": "Pará",
    "pb": "Paraíba",
    "pr": "Paraná",
    "pe": "Pernambuco",
    "pi": "Piauí",
    "rj": "Rio de Janeiro",
    "rn": "Rio Grande do Norte",
    "rs": "Rio Grande do Sul",
    "ro": "Rondônia",
    "rr": "Roraima",
    "sc": "Santa Catarina",
    "sp": "São Paulo",
    "se": "Sergipe",
    "to": "Tocantins",
  };

  return mapping[`${uf}`.toLowerCase()];
};

const obfuscateEmail = email => {
  const numberOfAsteriks = 6
  const numberOfCharacters = 2;

  const parts = email.split("@");
  const endPosition = parts[0].length <= numberOfCharacters ? parts[0].length / 2 : numberOfCharacters;
  const asteriks = repeat("*", numberOfAsteriks).join("");

  return `${parts[0].substring(0, endPosition)}${asteriks}@${parts[1]}`;
};

const originalMyIsRegisterSuccess = apiResponse =>
  Boolean(apiResponse && apiResponse.status === "success" && apiResponse.data.success);

const originalMyIsRegisterDuplicate = apiResponse =>
  Boolean(apiResponse && apiResponse.status === "fail" && apiResponse.data.errorCode === ORIGINAL_MY_KEY_DUPLICATE_DOCUMENT_ERROR_CODE);

const originalMyIsDocumentStatusSuccess = apiResponse =>
  Boolean(apiResponse && apiResponse.status === "success" && apiResponse.data.success && apiResponse.data.status === "confirmed");

const originalMyIsDocumentStatusNonexistent = apiResponse =>
  Boolean(apiResponse && apiResponse.status === "success" && apiResponse.data.reason === "nonexistent");

const truncate = (value, { max = 50, tail = "..."} = {}) => {
  if (!value || value.length <= max) return value;

  return compose(concat(__, tail), take(max))(value);
};

module.exports = {
  brazilUFToStateName,
  debug,
  fetchUsedMemory,
  forceGC,
  forceGCAndLog,
  generateHash,
  isBlank,
  isDev,
  isJSON,
  isMainApp,
  isPresent,
  isSignerApp,
  isString,
  isInvalidNumber,
  isValidNumber,
  obfuscateEmail,
  originalMyIsRegisterSuccess,
  originalMyIsRegisterDuplicate,
  originalMyIsDocumentStatusSuccess,
  originalMyIsDocumentStatusNonexistent,
  promisify,
  rejectIfFalsy,
  safelyParseJSON,
  truncate,
};
