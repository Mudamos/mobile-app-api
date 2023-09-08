"use strict";

const {
  dropLast,
  mergeRight,
  takeLast,
} = require("ramda");

const crypto = require("crypto");
const MudamosLibCrypto = require("mudamos-libcrypto");

const { isUserProfileComplete } = require("../../models/user");
const { debug } = require("../../utils");

const config = require("../../../config")();

const fail = message => ({
  status: "fail",
  data: { message },
});

const parseMessage = message => {
  const tokens = String(message).split(";");
  const [publicKey, signature] = takeLast(3, tokens);
  const userMessage = dropLast(3, tokens).join(";");
  const integratorMessage = dropLast(4, tokens).join(";");

  return {
    userMessage,
    integratorMessage,
    publicKey,
    signature,
    block: message,
  };
};

const MESSAGE_SIGN_INTEGRATOR_APP_ID = "rxc";
const INTEGRATOR_SIGNATURE_ENCODING = "hex";
const TIMESTAMP_LENGTH = 24;
const DIVIDER_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 510;
const MAX_USER_MESSAGE_LEGNTH = 120 + TIMESTAMP_LENGTH + DIVIDER_LENGTH;

const isValidLength = length => message =>
  message && message.length <= length;

const isValidMessageLength = isValidLength(MAX_MESSAGE_LENGTH);
const isValidUserMessageLength = isValidLength(MAX_USER_MESSAGE_LEGNTH);

const validateContent = content =>
  new Promise((resolve, reject) => {
    const isValid = MudamosLibCrypto.verifyMessage(content.publicKey, content.userMessage, content.signature);
    return isValid ? resolve() : reject();
  })
  .catch(() => Promise.reject(fail("invalid-payload")));

const validateMinedContent = (content, { difficulty }) =>
  new Promise((resolve, reject) => {
    const isValid = MudamosLibCrypto.checkMinedMessage(content.userMessage, difficulty, content.block);
    return isValid ? resolve() : reject();
  })
  .catch(() => Promise.reject(fail("invalid-payload")));

const isValidIntegratorSignature = ({ integrator, message, secret, logger }) => {
  if (integrator.appId !== MESSAGE_SIGN_INTEGRATOR_APP_ID) {
    logger.error("Integrator signature is invalid. Unknown integrator app id", integrator);
    return false;
  }

  if (!integrator.signature) {
    logger.error("Integrator signature is invalid. Signature is not defined", integrator);
    return false;
  }

  if (!secret) {
    logger.error("Cannot validate custom sign. Integrator secret is missing");
    return false;
  }

  const hash = crypto.createHmac("sha256", secret)
                     .update(message)
                     .digest(INTEGRATOR_SIGNATURE_ENCODING);

  debug("Hash being compared", hash);

  if (hash.length !== integrator.signature.length) {
    logger.error("Integrator signature is invalid. Size is off", { integrator, message });
    return false;
  }

  if (crypto.timingSafeEqual(Buffer.from(hash, INTEGRATOR_SIGNATURE_ENCODING), Buffer.from(integrator.signature, INTEGRATOR_SIGNATURE_ENCODING))) {
    return true;
  } else {
    logger.error("Integrator signature is invalid. Signature is different", { integrator, message });
    return false;
  }
}

const ValidateCustomMessageSign = ({ appConfigRepository, logger }) => async ({ integrator, message, user }) => {
  logger.info("Validating custom message", message);
  const content = parseMessage(message);
  logger.info("Validating custom message (parsed)", content);

  const isValidIntegrator = isValidIntegratorSignature({
    integrator: integrator || {},
    message: content.integratorMessage,
    secret: config("SIGNER_MESSAGE_INTEGRATOR_SECRET"),
    logger,
  });

  if (!isValidIntegrator) {
    throw fail("invalid-integrator-signature");
  }

  if (!isValidMessageLength(content.block) || !isValidUserMessageLength(content.userMessage)) {
    throw fail("invalid-payload-size");
  }

  await validateContent(content);

  const { value: difficulty } = await appConfigRepository.findByName("difficulty");
  await validateMinedContent(content, { difficulty: parseInt(difficulty, 10) });

  debug("user:", user);

  if (!isUserProfileComplete({ user, skipMobile: config("MOBILE_STATUS"), legacy: true })) {
    throw fail("incomplete-profile");
  }

  if (user.wallet_key !== content.publicKey) {
    throw fail("invalid-wallet");
  }

  return mergeRight(content, { valid: true });
};

module.exports.ValidateCustomMessageSign = ValidateCustomMessageSign;
