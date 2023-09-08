var SendResponse = require('../../libs/helpers/send-response')
	, ErrorModel = require('../../libs/models/response/error')
	, AuthService = require('../services/auth')
	, UserService = require('../services/user')
	, Sign = require('../../libs/helpers/sign')
	, async = require('async')
	, validator = require('validator');

module.exports = function (router, passport, app, { fbLimitedAuth }) {

	router.post("/facebook/token", (req, res) => {
		Sign.verifyMineMessage(req.headers.access_token || "", req.body.block || "")
			.then(success => {
				if (!success) {
					res.status(401).send('Unauthorized')
				} else {
					passport.authenticate('facebook_v2', function (err, result, user) {
						if (user)
							user = JSON.parse(user);

						if (err && err.oauthError && err.oauthError.statusCode == 400) {
							res.status(404).send(new ErrorModel('error', JSON.parse(err.oauthError.data).error.message, JSON.parse(err.oauthError.data).error.code));
						}
						else {
							if (user && validator.isEmail(user.profile_email) && user.create) {
								async.queue(UserService.sendNotificationMailUser(user, req.body.petition || null, result.data.access_token), 1);
							}

							SendResponse.send(res, result);
						}

					})(req, res);
				}
			})
	});

  router.post("/facebook/limited_token", (req, res) => {
    fbLimitedAuth({ token: req.headers.access_token, block: req.body.block })
      .then(([result, user]) => {
        if (validator.isEmail(user.profile_email) && user.create) {
          async.queue(UserService.sendNotificationMailUser(user, req.body.petition || null, result.data.access_token), 1);
        }

        SendResponse.send(res, result);
      })
      .catch(error => {
        if (error.status) {
          res.status(error.status).send(error.message);
        } else {
          res.status(401).send("Unauthorized");
        }
      });
  });
};
