"use strict";

const SuccessModel = require("../../../libs/models/response/success");
const ValidationModel = require("../../../libs/models/response/validation");
const { PETITION_MOBILE_CACHE_KEY_PREFIX } = require("../../models");
const listErrors = require("../../../libs/helpers/errors-list");

const toKey = value => `${PETITION_MOBILE_CACHE_KEY_PREFIX}:${value}`;

const PlipMobileValidationSender = ({
  Cache,
  PinCode,
  SMSSender,
  config,
  petitionRepository,
  petitionMobileRepository,
}) => ({ deviceUniqueId, userId, plipId, phone }) =>
  ValidationModel.validateRequest("plipMobileValidationSender", "ErrorPlipMobileSender", { deviceUniqueId, userId, plipId, phone })
    .then(() =>
      petitionRepository
        .findByVersionId(plipId)
        .then(({ id }) => {
          const pinCode = PinCode.generatePincode(5);
          const pinCodeExpiration = parseInt(config("CACHE_TIME_MOBILE"), 10);

          return petitionMobileRepository.transaction(async transaction => {
            const previous = await petitionMobileRepository.findByUserIdAndPetitionId({ userId, petitionId: id }, { transaction }).catch(() => null);

            if (previous && previous.isValidated && previous.deviceUniqueId === deviceUniqueId) {
              const error = "ErrorPlipMobileAlreadyValidated";
              throw new ValidationModel("fail", "validation", listErrors[error].message, null, listErrors[error].errorCode);
            }

            if (previous) {
              if (previous.deviceUniqueId !== deviceUniqueId || previous.phone !== phone) {
                await petitionMobileRepository.updateById(previous.id, { deviceUniqueId, isValidated: false, phone }, { transaction });
              }
            } else {
              await petitionMobileRepository.create({
                deviceUniqueId,
                userId,
                petitionId: id,
                isValidated: false,
                phone,
              }, { transaction });
            }

            await Cache.setKey(toKey(phone), JSON.stringify({ pinCode }), pinCodeExpiration);

            const sms = new SMSSender({ number: phone, pinCode }, { message: `Seu código de verificação de assinatura Mudamos: ${pinCode}` });
            await sms.send();

            const result = config("NODE_ENV") !== "production" ? { pinCode } : {};
            return new SuccessModel("success", result);
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


module.exports.PlipMobileValidationSender = PlipMobileValidationSender;
