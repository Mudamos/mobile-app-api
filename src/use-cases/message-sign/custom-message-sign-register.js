"use strict";

const { debug } = require("../../utils");
const LogModel = require("../../../libs/models/log/log");

const CustomMessageSignRegister = ({ signedMessageRepository, logger, enqueueMessage }) => async ({ message, userId, integratorId, result }) => {
  logger.info("Will register signed message. User id:", userId);

  debug(result);

  const signedMessage = await signedMessageRepository
    .create({ content: message, userId, integratorId });

  try {
    await enqueueMessage({
      integrator: {
        id: integratorId,
      },
      payload: {
        message: result.userMessage,
        publicKey: result.publicKey,
        signature: result.signature,
      },
    });
  } catch (error) {
    const payload = {
      integratorId,
      signedMessage,
      result,
    };

    logger.error("Failed to enqueue message sign. Signed message id:", signedMessage.id, error.message, error);
    await LogModel.log("SIGN-MESSAGE-PUBLISH-INTEGRATOR-CALLBACK", JSON.stringify(payload), "SIGN-MESSAGE-PUBLISH-INTEGRATOR-CALLBACK-ERROR", true);
  }

  return signedMessage;
};

module.exports.CustomMessageSignRegister = CustomMessageSignRegister;
