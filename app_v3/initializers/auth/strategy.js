var _ = require('lodash')
	, passport = require('passport')
	, TokenService = require('../../services/token')
	, AuthService = require('../../services/auth')
	, BasicStrategy = require('passport-http').BasicStrategy
	, BearerStrategy = require('passport-http-bearer').Strategy
	, CacheRedis = require('../../../config/initializers/cache-redis')
	, Cache = new CacheRedis()
  , SuccessModel = require('../../../libs/models/response/success')
  , LogModel = require('../../../libs/models/log/log');

passport.serializeUser(function (user, done) {
	return done(null, user);
});

passport.deserializeUser(function (id, done) {
	UserService.findById(id, function (err, user) {
		return done(err, user);
	});
});

passport.use(new BearerStrategy(
	function (accessToken, done) {
		Cache.getKey(accessToken)
			.then(user => {
				done(null, JSON.parse(user), { scope: '*' });
			})
			.catch(err => done(err))
	}
));
