"use strict";

const {
  allPass,
  contains,
  flip,
  pipe,
  prop,
  propEq,
} = require("ramda");

const {
  isBlank,
} = require("../utils");

module.exports = class Petition {
  constructor(props = {}) {
    this.id = props.id;

    this.cityId = props.cityId;
    this.petitionId = props.petitionId;
    this.versionId = props.versionId;

    this.createdAt = props.createdAt;
    this.name = props.name;
    this.pageUrl = props.pageUrl;
    this.pdfUrl = props.pdfUrl;
    this.scopeCoverage = props.scopeCoverage;
    this.sha = props.sha;
    this.status = props.status;
    this.transactionDate = props.transactionDate;
    this.transactionId = props.transactionId;
    this.uf = props.uf;
  }
};

const NATIONWIDE_COVERAGE = "nationwide";
const STATEWIDE_COVERAGE = "statewide";
const CITYWIDE_COVERAGE = "citywide";

module.exports.NATIONWIDE_COVERAGE = NATIONWIDE_COVERAGE;
module.exports.STATEWIDE_COVERAGE = STATEWIDE_COVERAGE;
module.exports.CITYWIDE_COVERAGE = CITYWIDE_COVERAGE;

const isNationalCause = petition => allPass([
  pipe(prop("cityId"), isBlank),
  pipe(prop("uf"), isBlank),
  pipe(prop("scopeCoverage"), flip(contains)([STATEWIDE_COVERAGE, CITYWIDE_COVERAGE])),
])(petition);

module.exports.isNationalCause = isNationalCause;

const isStateNationalCause = petition => allPass([
  pipe(prop("uf"), isBlank),
  propEq("scopeCoverage", STATEWIDE_COVERAGE),
])(petition);

module.exports.isStateNationalCause = isStateNationalCause;

const isCityNationalCause = petition => allPass([
  pipe(prop("cityId"), isBlank),
  propEq("scopeCoverage", CITYWIDE_COVERAGE),
])(petition);

module.exports.isCityNationalCause = isCityNationalCause;

const isDefaultScope = scope => flip(contains)([
  NATIONWIDE_COVERAGE,
  STATEWIDE_COVERAGE,
  CITYWIDE_COVERAGE,
])(scope);

module.exports.isDefaultScope = isDefaultScope;
