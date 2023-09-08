var _ = require('lodash')
	, passport = require('passport')
	, configAuth = require('../../../config/initializers/auth/facebook')
	, TokenService = require('../../services/token')
	, AuthService = require('../../services/auth')
	, BasicStrategy = require('passport-http').BasicStrategy
	, BearerStrategy = require('passport-http-bearer').Strategy
	, FacebookTokenStrategy = require('passport-facebook-token')
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

passport.use('facebook_v2', new FacebookTokenStrategy({
	clientID: configAuth.facebookAuth.clientID,
	clientSecret: configAuth.facebookAuth.clientSecret,
},
	function (accessToken, refreshToken, profile, done) {
		var token = TokenService.generateAccessToken();
		AuthService.loginFacebook(profile, token)
			.then(user => {
				return done(null, new SuccessModel('success', token), user);
			}).catch(err => {
         return done(null, err);
			})
	}
));

passport.use('local_v2', new BasicStrategy(
	function (username, password, done) {
		var token = TokenService.generateAccessToken();
		AuthService.login(username, password, token)
			.then(ok => {
				return done(null, new SuccessModel('success', token));
			})
			.catch(err =>{
				return done(null, err)
			})
	})
);

passport.use(new BearerStrategy(
	function (accessToken, done) {
		Cache.getKey(accessToken)
			.then(user => {
				done(null, JSON.parse(user), { scope: '*' });
			})
			.catch(err => done(err))
	}
));
