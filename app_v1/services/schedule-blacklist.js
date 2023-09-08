const nconf = require('nconf');
const _ = require('lodash');
const config = require('nconf');
const moment = require('moment');
const async = require('async');
const path = require('path');

nconf
	.use('memory')
	.argv()
	.env();

const BlacklistModel = require('../models/blacklist/blacklist');
const TraceModel = require('../../libs/models/log/trace');
const AccessModel = require('../../libs/models/log/access');
// const Connection = require('../../config/initializers/database');

const maxMinutes = parseInt(config.get("BLACK_LIST_USER_TIME_MINUTES"), 10);

class ScheduleBlackList {
	static starBlackList() {
		return BlacklistModel.findBlackListType('UserError')
			.then(blacklist => Promise.all((blacklist || []).map(item => {
				if (moment().diff(moment(item.blacklist_create), 'minutes') > maxMinutes) {
					return BlacklistModel.deleteById(item.blacklist_id)
						.then(success => success && AccessModel.deleteByUser(item.user_id, 1))
						.then(success => success && TraceModel.log('PROCESS-USER-BLACKLIST', `Blacklist  : ${JSON.stringify(JSON.stringify(item))}`, ``, false))
						.catch(err => TraceModel.log('PROCESS-USER-MUDAMOS', `Blacklist  : ${JSON.stringify(JSON.stringify(item))}`, `Err  : ${JSON.stringify(err)}`, true));
				}
			})));
	}
}

module.exports = ScheduleBlackList;
