var ProfileModel = require('../models/user/profile')
	, listErrors = require('../../libs/helpers/errors-list')
	, SuccessModel = require('../../libs/models/response/success')
	, UserModel = require('../models/user/user')
	, ValidationModel = require('../../libs/models/response/validation')
	, ValidateAttribute = require('../../libs/models/validate/attribute')
	, CacheRedis = require('../../config/initializers/cache-redis')
	, Cache = new CacheRedis()
	, UserValidate = require('../../libs/helpers/user')
	, AddressService = require('./address');

class ProfileService {

	constructor() { }

  static updateUserProfile(user, accessToken) {
    return ValidationModel.validateRequest('userInfo', 'ErrorUserProfile', user)
      .then(() => user.voteCity && ValidationModel.validateRequest('userVoteAddress', 'ErrorProfileInvalidVoteCity', user.voteCity))
      .then(() => {
        return Cache.getKey(accessToken)
      })
      .then(JSON.parse)
      .then(userCache => {
        if (user.zipcode && userCache.user_zipcode !== user.zipcode) {
          return AddressService.search(user.zipcode)
            .then(address => { return { userCache, address }});
        } else {
          return { userCache };
        }
      })
      .then(async ({ userCache, address }) => {
        if (address && address.status === "success") {
          user.zipcode = address.data.zipcode;
          user.state = address.data.state;
          user.city = address.data.city;
          user.district = address.data.district;
          user.uf = address.data.uf;
          user.lat = address.data.lat;
          user.lng = address.data.lng;
        }

        if (user.voteidcard) {
          const existentUser = await UserModel.findByVoteCardId(user.voteidcard);

          if (existentUser) {
            return Promise.reject(new ValidationModel(
              'fail',
              'validation',
              listErrors['ErrorUserVoteIdCardDuplicate'].message,
              [new ValidateAttribute('voteidcard', listErrors['ErrorUserVoteIdCardDuplicate'].message)],
              listErrors['ErrorUserVoteIdCardDuplicate'].errorCode
            ));
          }
        }

        return ProfileModel.updateUserProfile(user, userCache)
      })
      .then(userSet => Cache.setKey(accessToken, JSON.stringify(userSet)))
      .then(userNew => {
        userNew = JSON.parse(userNew);
        return new SuccessModel('success', { complete: UserValidate.validateComplete(userNew), user: userNew });
      })
  }

	static validateUser(accessToken) {
		return Cache.getKey(accessToken)
			.then(user => user && UserModel.findById(JSON.parse(user).user_id))
			.then(user => user && new SuccessModel('success', { complete: UserValidate.validateComplete(user), user: user }))
			.catch(err => err && Promise.reject(new FailModel('fail', 'profile', listErrors['ErrorParameter'].message, listErrors['ErrorParameter'].errorCode)))
	}
}

module.exports = ProfileService;
