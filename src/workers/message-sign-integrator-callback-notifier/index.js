"use strict";

const {
  always,
  pick,
  mergeRight,
} = require("ramda");
const requester = require("request-promise");
const fs = require("fs");
const path = require("path");

const { debug, truncate } = require("../../utils");

const timeout = 15 * 1000;
const parse = JSON.parse;
const messageAttributes = pick(["MessageId", "Body"]);

const MESSAGE_SIGN_INTEGRATOR_APP_ID = "rxc";

const encodeSecret = secret => Buffer.from(secret, "utf8").toString("base64");

// See: bin/install-custom-ca-bundle
const caPath = path.resolve(__dirname, "../../../lets_encrypt_bundle_ca.pem");
const CUSTOM_INTEGRATOR_BUNDLE_CA = fs.existsSync(caPath) ? fs.readFileSync(caPath) : null;

module.exports = ({ config, logger = console }) => async (message, done) => {
  logger.info("Start processing integrator callback: ", messageAttributes(message));

  const { integrator, payload } = parse(message.Body);
  if (integrator.id !== MESSAGE_SIGN_INTEGRATOR_APP_ID) {
    logger.error("Unknown integrator id", integrator.id, "Skipping");
    done();
    return;
  }

  const integratorSecret = config("SIGNER_MESSAGE_INTEGRATOR_SECRET");

  const options = config("USE_MESSAGE_INTEGRATOR_CA", always(false))
    ? { agentOptions: { ca: CUSTOM_INTEGRATOR_BUNDLE_CA } }
    : {};

  requester(mergeRight({
    uri: config("SIGNER_MESSAGE_INTEGRATOR_CALLBACK_HOST"),
    method: "POST",
    headers: {
      "Authorization": `Bearer ${encodeSecret(integratorSecret)}`,
    },
    body: payload,
    json: true,
    timeout,
  }, options)).then(() => {
    debug("Successfully called integrator callback");
    done();
  }).catch(error => {
    logger.error("Failed to contact the integrator", truncate(error.message), error.statusCode, error.cause);

    // Message will return to the queue
    done(new Error(error));
  });
};
