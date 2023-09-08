"use strict";

const OneSignal = require("onesignal-node");

const logCreator = require("../log");

const {
  keys,
} = require("ramda");

const {
  isBlank,
  promisify,
} = require("../../utils");

const {
  CITYWIDE_COVERAGE,
  STATEWIDE_COVERAGE,
  NATIONWIDE_COVERAGE,

  isNationalCause,
} = require("../../models/petition");

module.exports = config => {
  const { logger } = logCreator(config);

  const client = new OneSignal.Client({
    app: {
      appAuthKey: config("ONESIGNAL_API_KEY"),
      appId: config("ONESIGNAL_APP_ID"),
    },
  });

  const sendNotification = promisify(client.sendNotification, client);

  const notify = ({ body, title, params = {} }) => {
    const notification = new OneSignal.Notification({
      contents: { en: body },
    });

    keys(params).forEach(name => notification.setParameter(name, params[name]));
    notification.setParameter("headings", { en: title });

    return sendNotification(notification);
  };

  const notifyWithEmail = ({ body, title, email }) =>
      notify({ body, title, params: { filters: [{ field: "email", value: email }]}});

  const notifyWithFilters = ({ body, title, filters }) =>
      notify({ body, title, params: { filters } });

  return {
    notify,
    notifyWithEmail,
    notifyWithFilters,

    notifyWithPetition: ({ cityRepository }) => async ({ body, title, petition }) => {
      if (isNationalCause(petition) || petition.scopeCoverage === NATIONWIDE_COVERAGE || isBlank(petition.scopeCoverage)) {
        logger.debug("[Notifier]", "Will notify all users");

        const params = {
          included_segments: ["All"],
        };

        return notify({ body, title, params });
      } else if (petition.scopeCoverage === CITYWIDE_COVERAGE) {
        logger.debug("[Notifier]", "Will notify citywide");
        const city = await cityRepository.findById(petition.cityId);
        const filters = [
          { field: "tag", key: "city", relation: "=", value: city.name },
          { field: "tag", key: "uf", relation: "=", value: city.uf.toLowerCase() },
        ];

        return notifyWithFilters({ body, title, filters });
      } else {
        logger.debug("[Notifier]", "Will notify statewide");
        const value = petition.uf.toLowerCase();
        const filters = [
          { field: "tag", key: "uf", relation: "=", value },
        ];

        return notifyWithFilters({ body, title, filters });
      }
    },
  };
};
