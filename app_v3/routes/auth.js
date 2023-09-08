const { pick, propOr, merge } = require("ramda");
const SendResponse = require("../../libs/helpers/send-response");

module.exports = (router, _passport, _app, { appleSignIn }) => {

  router.route("/apple/sign-in")
    .post((req, res) => {
      const payload = pick([
        "appleUserId",
        "email",
        "fullName",
        "identityToken",
        "plipId",
        "block",
      ], req.body || {});

      const attributes = merge(payload, { response: res });
      appleSignIn(attributes);
  });
};

