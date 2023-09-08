var _ = require('lodash')
	, config = require('nconf')
	, CacheRedis = require('../../config/initializers/cache-redis')
	, Cache = new CacheRedis()
	, AccessModel = require('../../libs/models/log/access')
	, BlackListModel = require('../models/blacklist/blacklist');

class BlacklistService {

	constructor() { }

	static verifyLogin(user) {
    const maxLogin = parseInt(config.get("BLACK_LIST_USER_LOGIN"), 10);

		return AccessModel.findByUser(user.user_id, 1)
			.then(access => {
				if (access && access.length >= maxLogin) {
					return BlackListModel.insert(user.user_id, user.user_wallet_id, 'UserError');
				}
			})
			.then(success => {
				return BlackListModel.findByUser(user.user_id, 'userError');
			})
			.then(blacklist => {
				var is_blacklist = false;
				if (blacklist.length) {
					is_blacklist = true;
				}
				return is_blacklist;
			});
	}
}

module.exports = BlacklistService;
