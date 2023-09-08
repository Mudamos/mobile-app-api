var config = require('nconf');

module.exports = {
	'facebookAuth': {
		'clientID': config.get('FACEBOOK_CLIENT_ID'),
		'clientSecret': config.get('FACEBOOK_CLIENT_SECRET'),
		'callbackURL': config.get('FACEBOOK_CALLBACK_URL')
	}
}
