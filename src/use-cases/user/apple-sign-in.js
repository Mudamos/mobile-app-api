"use strict";

const {
  always,
  compose,
  cond,
  defaultTo,
  head,
  isEmpty,
  join,
  merge,
  not,
  pick,
  propEq,
  T,
} = require("ramda");
const validator = require("validator");
const { debug, isBlank, isPresent } = require("../../utils");
const { APPLE_PROFILE_TYPE } = require("../../models/user-profile");

const SuccessModel = require("../../../libs/models/response/success");

const defaultToEmpty = defaultTo("");

const nameJoiner = compose(join(" "), ({ givenName, familyName }) => [givenName, familyName].filter(isPresent));

const buildName = fullName => compose(
  cond([
    [isEmpty, always(null)],
    [T, nameJoiner],
  ]),
  pick(["givenName", "familyName"])
)(fullName || {});


const emailSender = UserNotificationSender => async ({ isNewUser, user, plipId, token }) => {
  const legacyUser = merge(user, { create: isNewUser });
  const petition = plipId && { versionId: plipId };

  UserNotificationSender.sendNotificationMailUser(legacyUser, petition, token);
};

const defaultPictureUrl = config =>
  `${config("AWS_URL")}/${config("AWS_URL_IMG_BUCKET")}/images/profile/pictures/picture_defaul_normal.jpg`;

const shouldCreateNewUserAndProfile = isEmpty;
const shouldAddNewAppleProfile = not;

const AppleSignIn = ({
  AppleAuth,
  Cache,
  SendResponse,
  Sign,
  TokenService,
  UserNotificationSender,
  config,
  logger,
  profileRepository,
  userProfileRepository,
  userRepository,
}) => ({
  appleUserId,
  email,
  fullName,
  identityToken,
  plipId,
  block,
  response,
}) => {
  const unauthorized = () => response.status(401).send("Unauthorized");
  const sendEmail = emailSender(UserNotificationSender);

  const createNewUserAndProfile = ({ createProfile, findNewLegacyUser, fullName }) =>
    userRepository.transaction(async transaction => {
      const name = buildName(fullName);
      const createdUser = await userRepository.create({ name }, { transaction });

      const profile = await createProfile(transaction);

      const userProfile = await userProfileRepository.create({
        userId: createdUser.id,
        profileId: profile.id,
      }, { transaction });

      debug({ createdUser, profile, userProfile })
      const user = await findNewLegacyUser(createdUser.id, transaction);

      return { user, isNewUser: true };
    });

  const addNewProfile = ({ createProfile, findNewLegacyUser, firstProfile }) =>
    userRepository.transaction(async transaction => {
      const profile = await createProfile(transaction);

      const userProfile = await userProfileRepository.create({
        userId: firstProfile.user_id,
        profileId: profile.id,
      }, { transaction });

      debug({ firstProfile, profile, userProfile })
      const user = await findNewLegacyUser(firstProfile.user_id, transaction);

      return { user };
    });

  if (isBlank(appleUserId)) {
    unauthorized();
    return Promise.resolve();
  }

  return Sign.verifyMineMessage(defaultToEmpty(identityToken), defaultToEmpty(block))
    .then(success => {
      if (!success) {
        debug("Sign in mine was unsuccessful");

        unauthorized();
        return;
      }

      return AppleAuth.verifyIdToken(identityToken, {
        audience: config("APPLE_CLIENT_ID"),
        ignoreExpiration: config("APPLE_SIGN_IN_IGNORE_EXPIRATION"),
      })
        .then(async auth => {
          if (appleUserId !== auth.sub) {
            throw new Error("Different user");
          }

          const createProfile = transaction => profileRepository.create({
            email,
            type: APPLE_PROFILE_TYPE,
            status: true,
            profileId: appleUserId,
            picture: defaultPictureUrl(config),
          }, { transaction });

          const findNewLegacyUser = (id, transaction) =>
            userRepository.findByIdAndTypeLegacy(id, APPLE_PROFILE_TYPE, { transaction });

          const previousProfiles = await userRepository.findAllByEmailOrProfileIdLegacy({ email, profileId: appleUserId });
          const previousAppleProfile = previousProfiles.find(propEq("profile_type", APPLE_PROFILE_TYPE));
          const firstProfile = head(previousProfiles);

          if (shouldCreateNewUserAndProfile(previousProfiles)) {
            debug("Will create new user, profile and user profile");

            return createNewUserAndProfile({ createProfile, findNewLegacyUser, fullName });
          } else if (shouldAddNewAppleProfile(previousAppleProfile)) {
            debug("Will add new profile to existing user");

            return addNewProfile({ createProfile, findNewLegacyUser, firstProfile });
          } else {
            debug("User already has a apple profile. Proceeding to log in");

            return { user: previousAppleProfile };
          }
        })
        .then(async ({ user, isNewUser }) => {
          const authToken = TokenService.generateAccessToken();
          debug("User to be cached", { user, authToken });

          await Cache.setKey(authToken.access_token, JSON.stringify(user));

          if (user && validator.isEmail(user.profile_email) && isNewUser) {
            sendEmail({ isNewUser, user, plipId, token: authToken.access_token });
          }

          SendResponse.send(response, new SuccessModel("success", authToken));
        })
        .catch(error => {
          logger.error(error);

          return unauthorized();
        });
    })
    .catch(error => SendResponse.send(response, error));
};

module.exports.AppleSignIn = AppleSignIn;
