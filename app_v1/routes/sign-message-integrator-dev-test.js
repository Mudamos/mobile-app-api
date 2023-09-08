const crypto = require("crypto");
const { always, compose, prop, split } = require("ramda");

// Only used for testing message sign via integrator locally
module.exports = (router, _passport, _app, { config, logger, integratorAppLinkGeneratorDevTest  }) => {
  const integratorSecret = Buffer.from(config("SIGNER_MESSAGE_INTEGRATOR_SECRET"), "utf8").toString("base64");

  const isValidAuth = value => {
    const givenSecret = compose(prop(1), split(" "), String)(value);

    if (!givenSecret || givenSecret.length !== integratorSecret.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(givenSecret, "base64"), Buffer.from(integratorSecret, "base64"));
  };

  if (config("SIGNER_MESSAGE_DEV_TEST_CALLBACK_ENABLED", always(false))) {
    router.route("/callback")
      .post((req, res) => {
        const isValid = isValidAuth(req.headers.authorization);
        logger.info("Received test message sign integrator callback. Is valid auth?", isValid, req.body);

        if (isValid) {
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      });
  }

  if (config("SIGNER_MESSAGE_DEV_TEST_APP_LINK_ENABLED", always(false))) {
    router.route("/applink")
      .get((req, res) => {
        const urls = integratorAppLinkGeneratorDevTest({ params: req.query });

        res.render("sign-message-integrator-dev-test/applink", { urls });
      });
  }
};
