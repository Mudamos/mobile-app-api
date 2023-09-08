var _ = require('lodash')
	, config = require('nconf')
	, Facebook = require('../../libs/helpers/facebook')
	, listErrors = require('../../libs/helpers/errors-list')
	, validator = require('validator')
	, LogModel = require('../../libs/models/log/log')
	, TraceModel = require('../../libs/models/log/trace')
	, VoteModel = require('../models/vote/vote')
	, WalletModel = require('../models/wallet/wallet')
	, ConfigModel = require('../../libs/models/config/config')
	, SuccessModel = require('../../libs/models/response/success')
	, PetitionModel = require('../models/petition/petition')
	, ValidationModel = require('../../libs/models/response/validation')
	, ValidateAttribute = require('../../libs/models/validate/attribute')
	, CacheRedis = require('../../config/initializers/cache-redis')
	, UserModel = require('../models/user/user')
	, VoteModel = require('../models/vote/vote')
	, Cache = new CacheRedis()
	, MudamosLibCrypto = require('mudamos-libcrypto')
	, Promise = require('bluebird')
	, UserValidate = require('../../libs/helpers/user')
	, FactoryNotification = require('../../libs/factory/notification/notification-factory');

const facebook = new Facebook();

class MessageService {

	constructor() { }

	static signatureBlockchainStatus(signMessage){
			return VoteModel.findBySignaturesPetitionBlockchain(signMessage.signature)
			.then(vote => {
				if(!vote.blockchain_updatedat){
						throw new ValidationModel('fail', 'validation', listErrors['ErrorVoteBlockchainNotFound'].message, [new ValidateAttribute('blockchain_updatedat', listErrors['ErrorVoteBlockchainNotFound'].message)], listErrors['ErrorVoteBlockchainNotFound'].errorCode);
				}else{
					return new SuccessModel('success', { sign: vote });
				}
			})
	}

	static getMessagePlipByUser(plipId, accessToken) {
		var idVersion;
		return PetitionModel.findByIdVersionPettion(plipId)
			.then(petition => {
				if (!petition || !petition.petition_id_version) {
					throw new ValidationModel('fail', 'validation', listErrors['ErrorPetitionNotFound'].message, [new ValidateAttribute('message', listErrors['ErrorPetitionNotFound'].message)], listErrors['ErrorPetitionNotFound'].errorCode);
				} else {
					idVersion = petition.petition_id_version;
					return true;
				}
			})
			.then(idVersion => {
				return Cache.getKey(accessToken);
			})
			.then(user_cache =>{
				if(!user_cache){
					throw new ValidationModel('fail', 'validation', listErrors['ErrorUserNotFound'].message, [new ValidateAttribute('user', listErrors['ErrorUserNotFound'].message)], listErrors['ErrorUserNotFound'].errorCode);
				}
				return VoteModel.findByUserId(idVersion, JSON.parse(user_cache).user_id);
			})
			.then(vote => {
				if (!vote) {
					return new SuccessModel('success', {});
				} else {
					return new SuccessModel('success', { signMessage: { updatedAt: vote.Create } });
				}
			})
	}

	static getMessagePlipById(plipId, { cityName, uf } = {}) {
		return VoteModel.findByIdInfo(plipId, { cityName, uf })
			.then(vote => {
					return new SuccessModel('success', { info: vote });
			})
	}

	static getMessagePlipVersionById(versionId, { cityName, uf } = {}) {
		return VoteModel.findByIdVersionInfo(versionId, { cityName, uf })
			.then(vote => {
					return new SuccessModel('success', { info: vote });
			})
	}


	static getMessagePlip(versionId, limit) {
		return VoteModel.findByIdAndLimitRecords(versionId, limit, [0, 1])
			.then(votes => {
					return new SuccessModel('success', { votes: votes });
			})
	}

	static getMessagePlipBlockchain(versionId, limit) {
		return VoteModel.findByIdAndLimitRecords(versionId, limit, [1])
			.then(votes => {
					return new SuccessModel('success', { votes: votes });
			})
	}


	static getMessagePlipUserFriendsGroup(plipId, accessToken) {
		var limit_records = config.get('USER_FRIENDS_LIMIT_RECORDS');
		var profilesIdFacebook;
		var resultFriends = { 'Seus Amigos': [], 'Outros': [] };
		var _userCache;
		return Cache.getKey(accessToken)
			.then(user_cache => {
				if(!user_cache){
					throw new ValidationModel('fail', 'validation', listErrors['ErrorUserNotFound'].message, [new ValidateAttribute('user', listErrors['ErrorUserNotFound'].message)], listErrors['ErrorUserNotFound'].errorCode);
				}else{
					_userCache = JSON.parse(user_cache);
					return facebook.getFriends(_userCache.profile_id)
				}
			})
			.then(friends => {
				profilesIdFacebook = _.map(friends, function (friend) { return friend.id; });
				return VoteModel.findFriendsByPetition(_userCache.user_id, plipId, _userCache.user_lat, _userCache.user_lng, config.get('USER_FRIENDS_KM_DISTANCE'), config.get('USER_FRIENDS_LIMIT_RECORDS'), config.get('USER_DISTANCE_KM_UNIT'), profilesIdFacebook)
			})
			.then(friends => {
				if (friends)
					_.each(friends, (friend) => {
						if (friend.profile_type == 'app') {
							resultFriends['Outros'].push({ id: friend.profile_id, pictureUrl: friend.profile_picture, name: friend.user_name, signedAt: friend.vote_date })
						} else if (friend.profile_type == 'facebook') {
							resultFriends['Seus Amigos'].push({ id: friend.profile_id, pictureUrl: friend.profile_picture, name: friend.user_name, signedAt: friend.vote_date })
						}
					})
				return resultFriends;
			})
			.then(result => {
				if ((resultFriends['Seus Amigos'].length + resultFriends['Outros'].length) <= 3) {
					return VoteModel.findFriendsRandonByPetition(_userCache.user_id, plipId, config.get('USER_FRIENDS_LIMIT_RECORDS'))
				}
			})
			.then(friends_randon => {
				if (friends_randon) {
					_.each(friends_randon, (friend) => {
						resultFriends['Outros'].push({ id: friend.profile_id, pictureUrl: friend.profile_picture, name: friend.user_name, signedAt: friend.vote_date })
					})
				}
				return new SuccessModel('success', { users: resultFriends });
			})
	}

	static getMessagePlipUserFriends(plipId, accessToken) {
		var limit_records = config.get('USER_FRIENDS_LIMIT_RECORDS');
		var profilesIdFacebook;
		var resultFriends = []
		var _userCache;

		return Cache.getKey(accessToken)
			.then(user_cache => {
				if(!user_cache){
					throw new ValidationModel('fail', 'validation', listErrors['ErrorUserNotFound'].message, [new ValidateAttribute('user', listErrors['ErrorUserNotFound'].message)], listErrors['ErrorUserNotFound'].errorCode)
				}else{
				_userCache = JSON.parse(user_cache);
				return facebook.getFriends(_userCache.profile_id)
				}
			})
			.then(friends => {
				profilesIdFacebook = _.map(friends, function (friend) { return friend.id; });
				return VoteModel.findFriendsByPetition(_userCache.user_id, plipId, _userCache.user_lat, _userCache.user_lng, config.get('USER_FRIENDS_KM_DISTANCE'), config.get('USER_FRIENDS_LIMIT_RECORDS'), config.get('USER_DISTANCE_KM_UNIT'), profilesIdFacebook)
			})
			.then(friends => {
				if (friends)
					_.each(friends, (friend) => {
						resultFriends.push({ id: friend.profile_id, pictureUrl: friend.profile_picture })
					})
				return resultFriends;
			})
			.then(result => {
				if (resultFriends.length <= 3) {
					return VoteModel.findFriendsRandonByPetition(_userCache.user_id, plipId, config.get('USER_FRIENDS_LIMIT_RECORDS'))
				}
			})
			.then(friends_randon => {
				if (friends_randon) {
					_.each(friends_randon, (friend) => {
						resultFriends.push({ id: friend.profile_id, pictureUrl: friend.profile_picture })
					})
				}
				return new SuccessModel('success', { users: resultFriends, total: resultFriends.length });
			})
	}


	static getMessagePlipUserGroup(plipId) {
		var limit_records = config.get('USER_FRIENDS_LIMIT_RECORDS');
		var resultFriends = { 'Facebook': [], 'Outros': [] };

		return VoteModel.findFriendsRandonByPetition(0, plipId, config.get('USER_FRIENDS_LIMIT_RECORDS'))
			.then(friends => {
				if (friends)
					_.each(friends, (friend) => {
						if (friend.profile_type == 'app') {
							resultFriends['Outros'].push({ id: friend.profile_id, pictureUrl: friend.profile_picture, name: friend.user_name, signedAt: friend.vote_date })
						} else if (friend.profile_type == 'facebook') {
							resultFriends['Facebook'].push({ id: friend.profile_id, pictureUrl: friend.profile_picture, name: friend.user_name, signedAt: friend.vote_date })
						}
					})
				return new SuccessModel('success', { users: resultFriends });
			})
	}

	static getMessagePlipUsers(plipId) {
		var limit_records = config.get('USER_FRIENDS_LIMIT_RECORDS');
		var resultFriends = []
			return VoteModel.findFriendsRandonByPetition(0, plipId, config.get('USER_FRIENDS_LIMIT_RECORDS'))
			.then(friends_randon => {
				if (friends_randon) {
					_.each(friends_randon, (friend) => {
						resultFriends.push({ id: friend.profile_id, pictureUrl: friend.profile_picture })
					})
				}
				return new SuccessModel('success', { users: resultFriends, total: resultFriends.length });
			})
	}

	static getMessagePlipUser(plipId, group) {
		return VoteModel.findByIdAndRangeDate(plipId, dateFrom, dateTo, [1])
			.then(votes => {
				if (!votes) {
					return new SuccessModel('success', {});
				} else {
					return new SuccessModel('success', { votes: votes });
				}
			})
	}

	static signMessage(signMessage, accessToken, ipClient) {
		var _user, _petition;
		var _wallet, _message, _configs, _ipCount = 1;
		var _block = signMessage.block.split(';');
		var _message = [_block[0], _block[1], _block[2], _block[3], _block[4], _block[5]].join(";");

		//TO:DO Validar o ip na blackList

		return Promise.using(MudamosLibCrypto.verifyMessage(_block[6], _message, _block[7]), result => {
			if (!result) {
				throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorSignMessage'].message)], listErrors['ErrorSignMessage'].errorCode);
			}
			return result;
		})
			.then(success => {
				return PetitionModel.findByIdVersionPettion(signMessage.petitionId)
					.then(petition => {
						if (!petition || !petition.petition_id_version) {
							throw new ValidationModel('fail', 'validation', listErrors['ErrorPetitionNotFound'].message, [new ValidateAttribute('message', listErrors['ErrorPetitionNotFound'].message)], listErrors['ErrorPetitionNotFound'].errorCode);
						} else {
							_petition = petition;
							signMessage.petitionId = petition.petition_id_version;
							return true;
						}
					})
			})
			.then(success => {
				return ConfigModel.getConfigList(['difficulty', 'ipCount', 'ipCountExpire'])
			})
			.then(configs => {
				_configs = configs;
				return Cache.getKey(ipClient)
			})
			.then(_ipCount_cache => {
				if (_ipCount_cache)
					_ipCount = parseInt(_ipCount_cache);
				if (_ipCount && parseInt(_ipCount) > parseInt(_.find(_configs, { 'KeyName': 'ipCount' }).Value)) {
					Cache.setKeySync(ipClient, _ipCount, parseInt(_.find(_configs, { 'KeyName': 'ipCountExpire' }).Value))
					throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorSignIp'].message)], listErrors['ErrorSignMessage'].errorCode);
				}
				return Cache.getKey(accessToken)
			})
			.then(user_cache => {
				_user = JSON.parse(user_cache);
				if (!MudamosLibCrypto.checkMinedMessage(_message, parseInt(_.find(_configs, { 'KeyName': 'difficulty' }).Value), signMessage.block)) {
					throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorSignBlock'].message)], listErrors['ErrorSignMessage'].errorCode);
				}
				return UserModel.findById(_user.user_id);
			})
			.then(user => {
				if (!user || user.user_name != _block[0]) {
					throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorUserNotFound'].message)], listErrors['ErrorUserNotFound'].errorCode);
				} else if (!user.user_wallet_id || !user.wallet_key) {
					throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorSignWalletNotFound'].message)], listErrors['ErrorSignWalletNotFound'].errorCode);
				} else if (!user.mobile_id) {
					throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorSignMobileNotFound'].message)], listErrors['ErrorSignMobileNotFound'].errorCode);
				} else if (user.user_zipcode != _block[1] || user.user_voteidcard != _block[2]) {
					throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorUserNotFound'].message)], listErrors['ErrorUserNotFound'].errorCode);
				} else if (user.wallet_key != _block[6]){
					throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('message', listErrors['ErrorSignWallet'].message)], listErrors['ErrorSignWallet'].errorCode);
				}

				signMessage.message = signMessage.block.concat(`;${_.find(_configs, { 'KeyName': 'difficulty' }).Value}`);
				signMessage.signature = _block[7];
				signMessage.userWalletId = user.user_wallet_id;
				signMessage.walletId = user.wallet_key;
				signMessage.status = 0;
				signMessage.userId = user.user_id;
				signMessage.userMobileId = user.mobile_id;

				return VoteModel.createVote(signMessage)
			})
			.then(message => {
				return Cache.setKey(ipClient, _ipCount + 1, parseInt(_.find(_configs, { 'KeyName': 'ipCountExpire' }).Value)).then(() => message);
			})
			.then(message => {
				FactoryNotification.create('VoteNotification',  _user , _petition).send();
				return new SuccessModel('success', { signMessage: { updatedAt: message.Create } });
			})
	}
}

module.exports = MessageService;
