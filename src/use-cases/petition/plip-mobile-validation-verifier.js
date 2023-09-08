"use strict";

const SuccessModel = require("../../../libs/models/response/success");
const { PETITION_MOBILE_CACHE_KEY_PREFIX } = require("../../models");

const toKey = value => `${PETITION_MOBILE_CACHE_KEY_PREFIX}:${value}`;

module.exports.PlipMobileValidationVerifier = ({ PinCode, petitionRepository, petitionMobileRepository }) => ({ plipId, userId, phone, pinCode }) =>
  Promise.resolve()
    .then(() => PinCode.validatePinCode(toKey(phone), pinCode, "ErrorPlipMobileValidationInvalid", "ErrorPlipMobileValidationInvalidPinCode"))
    .then(() => petitionRepository.findByVersionId(plipId))
    .then(({ id }) => petitionMobileRepository.findByUserIdAndPetitionId({ userId, petitionId: id }))
    .then(({ id }) => petitionMobileRepository.updateById(id, { isValidated: true }))
    .then(() => new SuccessModel("success"))
