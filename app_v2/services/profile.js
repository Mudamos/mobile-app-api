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
	, UserValidate = require('../../libs/helpers/user');

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

	static updateUserBirthday(user, accessToken) {
		return ValidationModel.validateRequest('birthday', 'ErrorUserBirthday', user)
			.then(sucess => {
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
			.then(user_cache =>{
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
			.then(user_set =>{
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			});
	}

	static updateUserProfile(user, accessToken) {
		return ValidationModel.validateRequest('userProfile', 'ErrorUserProfile', user)
			.then(sucess => {
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				return ProfileModel.updateUserProfile(user, JSON.parse(user_cache))
			})
			.then(user_set => { 
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			})
	}

	static setUserPhoto(photo, avatar_url, accessToken) {
		var _user;
		return ValidationModel.validateRequest('userPhoto', 'ErrorUserPhoto', { avatar : { filename : photo ? photo.filename : "" , avatar_url : avatar_url || "" } } )
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
			.then(user_set =>{
				return Cache.setKey(accessToken, JSON.stringify(user_set))
			})
			.then(user_new => {
				user_new = JSON.parse(user_new);
				return new SuccessModel('success', { complete: UserValidate.validateComplete(user_new), user: user_new });
			});
	}
}

module.exports = ProfileService;
