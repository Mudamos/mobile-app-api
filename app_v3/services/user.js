var _ = require('lodash')
	, bcrypt = require('bcrypt')
	, listErrors = require('../../libs/helpers/errors-list')
	, ValidationModel = require('../../libs/models/response/validation')
	, ValidateAttribute = require('../../libs/models/validate/attribute')
	, UserModel = require('../models/user/user')
	, PetitionModel = require('../models/petition/petition')
	, CacheRedis = require('../../config/initializers/cache-redis')
	, Cache = new CacheRedis()
	, SuccessModel = require('../../libs/models/response/success')
	, FailModel = require('../../libs/models/response/fail')
	, UserValidate = require('../../libs/helpers/user')
	, TokenService = require('./token')
	, NotificationService = require('./notification')
	, facebook = require('../../libs/helpers/facebook')
	, async = require('async')
	, config = require('nconf');

const resetPasswordExpire = parseInt(config.get("CACHE_TIME_RESET_PASSWORD"), 10);

class UserService {

	constructor() { }

	static createUserLogin(user, petition) {
		var accessToken = TokenService.generateAccessToken();

		return ValidationModel.validateRequest('userSignUp', 'ErrorUserValidate', user)
			.then(success => {
				const userByCpf = UserModel.findByCpf(user.cpf);
				const userByEmail = UserModel.findByEmailOrProfile(user.email, null);
				return Promise.all([userByCpf, userByEmail])
			})
			.then(userFound => {
				if (!userFound[0] && !userFound[1]) {
					return UserModel.createUserLogin({ cpf: user.cpf, email: user.email, hashPassCrypth: bcrypt.hashSync(user.password, bcrypt.genSaltSync(9)), termsAccepted: user.termsAccepted, picture: facebook.generateImgLink(null, 'user', null, 'normal') })
				} else if (userFound[0]) {
					return Promise.reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCpfDuplicate'].message, [new ValidateAttribute('cpf', listErrors['ErrorUserCpfDuplicate'].message)], listErrors['ErrorUserCpfDuplicate'].errorCode))
				} else {
					return Promise.reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserEmailDuplicate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserEmailDuplicate'].errorCode))
				}
			})
			.then(userSet => Cache.setKey(accessToken.access_token, JSON.stringify(userSet)).then(userSetCache => JSON.parse(userSetCache)))
			.then(userNew => {
				if (petition && petition.versionId) {
					return PetitionModel.findByIdVersionPettion(petition.versionId)
						.then(petition => {
							if (!petition || !petition.petition_id_version) {
								return Promise.reject(new ValidationModel('fail', 'validation', listErrors['ErrorPetitionNotFound'].message, [new ValidateAttribute('message', listErrors['ErrorPetitionNotFound'].message)], listErrors['ErrorPetitionNotFound'].errorCode));
							} else {
								return { userNew, petition };
							}
						})
				} else {
					return { userNew };
				}
			})
			.then(({ userNew, petition }) => {
				async.queue(NotificationService.sendMessage('EmailNotification', userNew, petition, NotificationService.generateLinkNotificationEmail(userNew, 'Notification_Email', accessToken)), 1);
				delete userNew.token_type;
				return new SuccessModel('success', { complete: UserValidate.validateComplete(userNew), user: userNew, access_token: accessToken.access_token });
			})
	}

	static updateUserLogin(user, accessToken) {
		return ValidationModel.validateRequest('userSignUpUpdate', 'ErrorUserValidate', user)
			.then(success => success && Cache.getKey(accessToken))
			.then(rawUserCache => {
				const userCache = JSON.parse(rawUserCache);
				if (!userCache) {
					return Promise.reject(new ValidationModel('fail', 'validation', listErrors['ErrorCacheEmpty'].message, [new ValidateAttribute('user', listErrors['ErrorCacheEmpty'].message)], listErrors['ErrorCacheEmpty'].errorCode));
				} else {
					return UserService.updateUser(user, accessToken)
						.then(newUser => ({ userCache, newUser }))
						.catch(err => {
							if (/Duplicate.*CPF/g.test(err.sqlMessage)) {
								return Promise.reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCpfDuplicate'].message, [new ValidateAttribute('cpf', listErrors['ErrorUserCpfDuplicate'].message)], listErrors['ErrorUserCpfDuplicate'].errorCode));
							} else if (/Duplicate.*Email/g.test(err.sqlMessage)) {
								return Promise.reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserEmailDuplicate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserEmailDuplicate'].errorCode));
							} else {
								return Promise.reject(new ValidationModel('fail', 'validation', listErrors['ErrorDataBaseQuery'].message, [new ValidateAttribute('email', listErrors['ErrorDataBaseQuery'].message)], listErrors['ErrorDataBaseQuery'].errorCode));
							}
						})
				}
			})
			.then(({ userCache, newUser }) => {
				if (userCache.profile_email !== newUser.profile_email) {
					async.queue(NotificationService.sendMessage('EmailNotification', newUser, null, NotificationService.generateLinkNotificationEmail(newUser, 'Notification_Email', { access_token: accessToken })), 1);
				}
				return { userCache, newUser };
			})
			.then(({ userCache, newUser }) => {
				if (userCache.profile_email !== newUser.profile_email) {
					return Cache.setKey(accessToken, JSON.stringify(newUser))
						.then(rawUserSetCache => ({ userCache, newUser: JSON.parse(rawUserSetCache) }));
				} else {
					return { userCache, newUser };
				}
			})
			.then(({ userCache, newUser }) => {
				if (userCache.profile_email !== newUser.profile_email) {
					return UserModel.updateValidate(newUser, null)
				} else {
					return newUser;
				}
			})
			.then(newUser => new SuccessModel('success', { complete: UserValidate.validateComplete(newUser), user: newUser, access_token: accessToken }))
	}

	static updateUser(user, accessToken) {
		return ValidationModel.validateRequest('userSignUpUpdate', 'ErrorUserValidate', user)
			.then(success => Cache.getKey(accessToken))
			.then(userCache => UserModel.updateUserLogin({ cpf: user.cpf, email: user.email, termsAccepted: user.termsAccepted }, JSON.parse(userCache)))
			.then(userSet => Cache.setKey(accessToken, JSON.stringify(userSet)))
			.then(rawUserCache => JSON.parse(rawUserCache))
	}

	static findByCpf(cpf) {
		return UserModel.findByCpf(cpf)
			.then(userFound => new SuccessModel('success', { user: userFound }))
	}

	static findByEmail(email) {
		return UserModel.findByEmail(email)
			.then(userFound => new SuccessModel('success', { user: userFound }))
	}

	static findUser(query) {
		if (query.cpf) {
			return this.findByCpf(query.cpf);
		} else if (query.email) {
			return this.findByEmail(query.email);
		} else {
			return { user: null };
		}
	}

	static getPetitions(user) {
		if (!user)  {
			return Promise.reject(new FailModel('fail', 'authentication', listErrors['ErrorUserNotFound'].message, listErrors['ErrorUserNotFound'].errorCode));
		}

		const { voteCardId } = user;

		return UserModel.findPetitions({ voteCardId })
      .then(petitions => new SuccessModel('success', { petitions }))
			.catch(err => Promise.reject(new FailModel('fail', 'authentication', listErrors['ErrorDataBaseQuery'].message, listErrors['ErrorDataBaseQuery'].errorCode)))
	}
}

module.exports = UserService;
