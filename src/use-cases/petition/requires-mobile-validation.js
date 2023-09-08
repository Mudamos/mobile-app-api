"use strict";

const SuccessModel = require("../../../libs/models/response/success");
const ValidationModel = require("../../../libs/models/response/validation");
const listErrors = require("../../../libs/helpers/errors-list");

module.exports.RequiresMobileValidation = ({ petitionRepository, petitionInfoRepository, petitionMobileRepository }) => ({ plipId, userId, deviceUniqueId }) =>
  ValidationModel.validateRequest("plipRequiresValidation", "ErrorPlipCheckRequiresMobileValidation", { userId, plipId, deviceUniqueId })
    .then(() =>
      petitionInfoRepository
        .findByVersionId(plipId)
        .then(async ({ requiresMobileValidation }) => {
          const lastValidated = await petitionMobileRepository.findLastValidatedByUserId(userId);

          if (requiresMobileValidation && lastValidated && lastValidated.deviceUniqueId === deviceUniqueId) {
            const plip = await petitionRepository.findByVersionId(plipId);
            const previous = await petitionMobileRepository.findByUserIdAndPetitionId({ userId, petitionId: plip.id }).catch(() => null);

            if (previous) {
              await petitionMobileRepository.updateById(previous.id, { isValidated: true, phone: lastValidated.phone });
            } else {
              await petitionMobileRepository.create({
                deviceUniqueId,
                userId,
                petitionId: plip.id,
                isValidated: true,
                phone: lastValidated.phone,
              });
            }
          }

          const isRequired = requiresMobileValidation &&
              (!lastValidated || lastValidated.deviceUniqueId !== deviceUniqueId);

          return new SuccessModel("success", {
            requiresMobileValidation: isRequired,
          });
        })
        .catch(error => {
          if (error.message == "Not found") {
            const err = "ErrorPetitionNotFound";
            throw new ValidationModel("fail", "validation", listErrors[err].message, null, listErrors[err].errorCode);
          }

          throw error;
        })
    );
