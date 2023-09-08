var SendResponse = require('../../libs/helpers/send-response')
	, ErrorModel = require('../../libs/models/response/error')
	, AuthService = require('../services/auth')
	, UserhService = require('../services/user')
	, Sign = require('../../libs/helpers/sign')
	, async  = require('async')
	, validator = require('validator');

module.exports = function (router, passport, app) {
	router.post('/token',
		(req, res) => {
			passport.authenticate('local_v1', { session: false }, function (err, result, info) {
				SendResponse.send(res, result);
			})(req, res);
		});

	router.get('/unlink/local', (req, res) => { });

	router.post("/facebook/token", (req, res) => {
		passport.authenticate('facebook_v1', function (err, result, user) {
			if (user)
				user = JSON.parse(user);
			if (err && err.oauthError && err.oauthError.statusCode == 400) {
				res.status(404).send(new ErrorModel('error', JSON.parse(err.oauthError.data).error.message, JSON.parse(err.oauthError.data).error.code));
			}
			else {
				if(user && validator.isEmail(user.profile_email) && user.create){
					async.queue(UserhService.sendNotificationMailUser(user, req.body.petition || null, result.data.access_token),1);
				}
			
				SendResponse.send(res, result);
			}
		})(req, res);
	});

	router.get('/unlink/facebook', (req, res) => { });

	router.post('/logout', (req, res) => {
		passport.authenticate('bearer', { session: false }, function (err, user, info) {
			if (user == false) {
				res.status(401).send('Unauthorized');
			} else {
				AuthService.logout(req.headers.authorization)
					.then(result => {
						SendResponse.send(res, result);
					})
					.catch(err => {
						SendResponse.send(res, err);
					})
			}
		})(req, res);
	})
};
