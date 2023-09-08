var _ = require('lodash')
  , PetitionModel = require('../models/petition/petition')
  , listErrors = require('../../libs/helpers/errors-list')
	, FailModel = require('../../libs/models/response/fail')
	, SuccessModel = require('../../libs/models/response/success')
	, ValidationModel = require('../../libs/models/response/validation')
	, CacheRedis = require('../../config/initializers/cache-redis')
	, Cache = new CacheRedis();

class PetitionService {

	constructor() { }

	static insertInfo(petition) {
    return ValidationModel.validateRequest('petitionInfo', 'ErrorSyncPetition', petition)
      .then(success => success && PetitionModel.insertInfo(petition))
      .then(petitionInfo => {
        if (petitionInfo) {
          return new SuccessModel('success', { petition: petitionInfo });
        } else {
          return Promise.reject(new FailModel('fail', 'pettion', listErrors['ErrorSyncPetition'].message, listErrors['ErrorSyncPetition'].errorCode))
        }
      })
	}

  static plipsPaginated(params) {
    return PetitionModel.plipsPaginated(params)
      .then(({ nextPage, page, petitions }) => {
        const result = new SuccessModel('success', { petitions });

        return { nextPage, page, result };
      })
      .catch(err => err && Promise.reject(new FailModel('fail', 'pettions', listErrors['ErrorParameter'].message, listErrors['ErrorParameter'].errorCode)))
  }

  static userSignedPlipsPaginated(params, voteCardId) {
    return PetitionModel.userSignedPlipsPaginated(voteCardId, params)
      .then(({ nextPage, page, petitions }) => {
        const result = new SuccessModel('success', { petitions });

        return { nextPage, page, result };
      })
    .catch(err => err && Promise.reject(new FailModel('fail', 'pettions', listErrors['ErrorParameter'].message, listErrors['ErrorParameter'].errorCode)))
  }

  static userFavoritePlipsPaginated(params, userId) {
    return PetitionModel.userFavoritePlipsPaginated(userId, params)
      .then(({ nextPage, page, petitions }) => {
        const result = new SuccessModel('success', { petitions });

        return { nextPage, page, result };
      })
      .catch(err => Promise.reject(new FailModel('fail', 'pettions', listErrors['ErrorParameter'].message, listErrors['ErrorParameter'].errorCode)))
  }
}

module.exports = PetitionService;
