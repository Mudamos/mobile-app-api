"use strict";

const path = require("path");
const { debug, isPresent, safelyParseJSON } = require("../../utils");
const { execFile } = require("child_process");
const { all, compose, pickAll, values } = require("ramda");
const SuccessModel = require("../../../libs/models/response/success");

const decoder = path.join(__dirname, "../../../bin/decode-fb-limited-token.js");

const unauthorizedError = () => {
  const error = new Error("Unauthorized");
  error.status = 401;

  return error;
};

const buildOldProfile = user => ({
  id: user.sub,
  displayName: user.name,
  emails: [{ value: user.email }],
  photos: [{ value: user.picture }],
});

const isValidProfileAttributes =
  compose(all(isPresent), values, pickAll(["sub", "name", "email"]));

const executionTimeout = 1000 * 30;

const processToken = async (token) => {
  debug("Will call node10 executable");

  return new Promise((resolve, reject) => {
    execFile("node10", [decoder, token], { timeout: executionTimeout }, (error, stdout, stderr) => {
      const fail = error || (stderr ? stderr.trim() : null);

      if (fail) {
        return reject(fail);
      }

      resolve(safelyParseJSON(stdout.trim()));
    });
  });
}

const FBLimitedAuth = ({ AuthService, SignVerifier, TokenService }) => async ({ token, block }) => {
  debug("Token", token);
  const signMiningResultSuccess = await SignVerifier.verifyMineMessage(String(token), String(block));

  if (!signMiningResultSuccess) {
    debug("Invalid mined message");
    throw unauthorizedError();
  }

  const decodedToken = await processToken(token).catch((err) => {
    debug("Failed sign in", err);
    throw unauthorizedError()
  });

  debug("Facebook jwt", decodedToken);

  if (!isValidProfileAttributes(decodedToken)) {
    throw unauthorizedError();
  }

  const profile = buildOldProfile(decodedToken);
  const appToken = TokenService.generateAccessToken();

  debug("Profile", profile);

  const user = await AuthService.loginFacebook(profile, appToken).then(JSON.parse);
  return [new SuccessModel("success", appToken), user];
};

module.exports.FBLimitedAuth = FBLimitedAuth;
