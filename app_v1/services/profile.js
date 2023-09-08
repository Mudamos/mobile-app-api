var listErrors = require('../../libs/helpers/errors-list')
	, config = require('nconf')
	, validator = require('validator')
	, path = require('path')
	, UserModel = require('../models/user/user')
	, ProfileModel = require('../models/user/profile')
	, WalleteModel = require('../models/wallet/wallet')
	, SuccessModel = require('../../libs/models/response/success')
	, ValidationModel = require('../../libs/models/response/validation')
	, ValidateAttribute = require('../../libs/models/validate/attribute')
	, CacheRedis = require('../../config/initializers/cache-redis')
	, SendFileAWS = require('../../libs/helpers/send-file-aws')
	, Cache = new CacheRedis()
	, UserValidate = require('../../libs/helpers/user')
	, NotificationService = require('./notification')
	, AddressService = require('./address')
	, TokenService = require('./token')
	, FailModel = require('../../libs/models/response/fail')
	, ValidationModel = require('../../libs/models/response/validation')
	, async = require('async');

class ProfileService {

	constructor() { }

	static validateUser(accessToken) {
		return Cache.getKey(accessToken)
			.then(user => {
				return UserModel.findById(JSON.parse(user).user_id);
			})
			.then(user => {
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user), user: user });
			})
	}

  static updateUserVoteCity(city, accessToken) {
    return ValidationModel.validateRequest('userVoteAddress', 'ErrorProfileInvalidVoteCity', city)
      .then(() => Cache.getKey(accessToken))
      .then(JSON.parse)
      .then(user => ProfileModel.updateUserVoteCity(user, city))
      .then(user => Cache.setKey(accessToken, JSON.stringify(user)))
      .then(JSON.parse)
      .then(user => new SuccessModel('success', { complete: UserValidate.validateComplete(user), user }));
  }

	static updateUserBirthday(user, accessToken) {
		return ValidationModel.validateRequest('birthday', 'ErrorUserBirthday', user)
			.then(success => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				return ProfileModel.updateUserBirthday(user, JSON.parse(user_cache))
			})
			.then(user_set => {
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			})
	}

	static updateUserZipCode(user, accessToken) {
		return ValidationModel.validateRequest('zipcode', 'ErrorUserZipCode', user)
			.then(success => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				return ProfileModel.updateUserZipCode(user, JSON.parse(user_cache))
			})
			.then(user_set => {
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			});
	}

	static updateUserDocuments(user, accessToken) {
		return ValidationModel.validateRequest('documents', 'ErrorUserDocuments', user)
			.then(success => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				return ProfileModel.updateUserDocuments(user, JSON.parse(user_cache))
			})
			.then(user_set => {
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			});
	}

	static insertUserWallet(user, accessToken) {
		var _user;
		return ValidationModel.validateRequest('wallet', 'ErrorWallet', user)
			.then(success => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				user_cache = JSON.parse(user_cache);
				user.user_id = user_cache.user_id;
				return WalleteModel.insertUserWallet(user)
			})
			.then(user_set => {
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			});
	}

	static updateUserProfile(user, accessToken) {
    if (user && user.name) {
      user.name = UserValidate.clearChar(user.name);
    }

		var _user_cache;
		return ValidationModel.validateRequest('userProfile', 'ErrorUserProfile', user)
			.then(success => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				_user_cache = JSON.parse(user_cache);
				if(_user_cache.user_zipcode != user.zipcode){
					return AddressService.searchGoogleApi(user.zipcode);
				}else{
					return null;
				}
			})
			.then(address => {
				if(address && address.status == "success"){
					user.zipcode = address.data.zipcode;
					user.state = address.data.state;
					user.city = address.data.city;
					user.district = address.data.district;
					user.uf = address.data.uf;
					user.lat = address.data.lat;
					user.lng = address.data.lng;
				}
				return ProfileModel.updateUserProfile(user, _user_cache)
			})
			.then(user_set => {
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			})
	}

	static updateUserEmail(user, accessToken) {
		var _user;
		return ValidationModel.validateRequest('userProfileEmail', 'ErrorEmailInvalid', user)
			.then(success => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				_user = JSON.parse(user_cache);
				if (_user.profile_email === user.profile_email)
					throw new ValidationModel('fail', 'validation', listErrors['ErrorEmailUpdate'].message, [new ValidateAttribute('profile_email', listErrors['ErrorEmailUpdate'].message)], listErrors['ErrorEmailUpdate'].errorCode);
				else
					return ProfileModel.updateUserEmail(user, JSON.parse(user_cache))
			})
			.then(user_set => {
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				if(_user.profile_email != user_new.profile_email && user_new.update){
					delete user_new.update;
					var accessToken = TokenService.generateAccessToken();
					async.queue(NotificationService.sendMessage('EmailNotification', user_new, null, NotificationService.generateLinkNotificationEmail(user_new, 'Notification_Email', accessToken)), 1);
				}
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			})
	}

	static updateUserEmailRootAuthorization(user, accessToken) {
		var _user;
		return ValidationModel.validateRequest('userProfileEmail', 'ErrorUserProfileEmail', user)
			.then(success => {
				return UserModel.findByEmail(user.profile_email)
			})
			.then(user_db => {
				if(!user_db){
					throw new ValidationModel('fail', 'profile_email', listErrors['ErrorUserNotFound'].message, [new ValidateAttribute('profile_email', listErrors['ErrorUserNotFound'].message)], listErrors['ErrorUserNotFound'].errorCode);
				}else{
					return ProfileModel.updateUserEmailRootAuthorization(user, user_db);
				}
			})
			.then(user_new => {
				if( (user.profile_email != user_new.profile_email) && user_new.update){
					delete user_new.update;
					var accessToken = TokenService.generateAccessToken();
					async.queue(NotificationService.sendMessage('EmailNotification', user_new, null, NotificationService.generateLinkNotificationEmail(user_new, 'Notification_Email', accessToken)), 1);
				}
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			})
	}


	static recovery(user, score) {
		var count_score = 0;
		return ValidationModel.validateRequest('userProfileEmail', 'ErrorUserProfileEmail', user)
			.then(success => {
				return UserModel.findByEmail(user.profile_email)
			})
			.then(user_db => {
				if(user_db){
					if(user_db.profile_email === user.profile_email)
						count_score += 1;
					if(user_db.user_name && user.user_name && UserValidate.removeDiacritics(user_db.user_name.toLowerCase()) === UserValidate.removeDiacritics(user.user_name.toLowerCase()))
						count_score += 1;
					if(user_db.user_cpf && user.user_cpf && user_db.user_cpf === user.user_cpf)
						count_score += 1;
					if(user_db.user_voteidcard && user.user_voteidcard && user_db.user_voteidcard === user.user_voteidcard)
						count_score += 1;
					if(user_db.user_birthday && user.user_birthday && user_db.user_birthday === user.user_birthday)
						count_score += 1;
					if(user_db.user_state && user.user_state && UserValidate.removeDiacritics(user_db.user_state.toLowerCase()) === UserValidate.removeDiacritics(user.user_state.toLowerCase()))
						count_score += 1;
					if(user_db.user_uf && user.user_uf && UserValidate.removeDiacritics(user_db.user_uf.toLowerCase()) === UserValidate.removeDiacritics(user.user_uf.toLowerCase()))
						count_score += 1;
					if(user_db.user_city && user.user_city && UserValidate.removeDiacritics(user_db.user_city.toLowerCase()) === UserValidate.removeDiacritics(user.user_city.toLowerCase()))
						count_score += 1;
					if(user_db.user_district && user.user_district && UserValidate.removeDiacritics(user_db.user_district.toLowerCase()) === UserValidate.removeDiacritics(user.user_district.toLowerCase()))
						count_score += 1;
					if(user_db.user_zipcode && user.user_zipcode && user_db.user_zipcode === user.user_zipcode)
						count_score += 1;
					if(user_db.mobile_number && user.mobile_number && user_db.mobile_number === user.mobile_number)
						count_score += 1;
				}

				if(count_score >= score)
					return new SuccessModel('success', { score: count_score, user: user_db })
				else{
					  throw new FailModel('fail', 'score', listErrors['ErrorScoreRecovery'].message, listErrors['ErrorScoreRecovery'].errorCode);
				}
			})
	}

	static setUserPhoto(photo, avatar_url, accessToken) {
		var _user;
		return ValidationModel.validateRequest('userPhoto', 'ErrorUserPhoto', { avatar: { filename: photo ? photo.filename : "", avatar_url: avatar_url || "" } })
			.then(success => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				_user = JSON.parse(user_cache);
				if (!avatar_url) {
					var SendFile = new SendFileAWS(path.resolve(__dirname, config.get('UPLOAD_FOLDER')).concat(`/${photo.filename}`), `images/profile/${_user.profile_id}.jpg`);
					return SendFile.sendImageAvatarAsync(config.get('AWS_URL_IMG_BUCKET'));
				}
			})
			.then(image_upload => {
				if (!image_upload) {
					_user.profile_picture = `${config.get('AWS_URL')}/${config.get('AWS_URL_IMG_BUCKET')}/images/profile/pictures/picture_defaul_normal.jpg`;
				} else {
					_user.profile_picture = !avatar_url ? `${config.get('AWS_URL')}/${config.get('AWS_URL_IMG_BUCKET')}/images/profile/${_user.profile_id}.jpg` : avatar_url;
				}
				return ProfileModel.updateUserPhoto(_user.profile_picture, _user)
			})
			.then(user_set => {
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			});
	}
}

module.exports = ProfileService;
