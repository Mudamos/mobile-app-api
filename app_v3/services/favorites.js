var _ = require('lodash')
  , FavoriteModel = require('../models/favorite/favorite')
  , listErrors = require('../../libs/helpers/errors-list')
	, FailModel = require('../../libs/models/response/fail')
	, SuccessModel = require('../../libs/models/response/success')
	, ValidationModel = require('../../libs/models/response/validation')
	, CacheRedis = require('../../config/initializers/cache-redis')
	, Cache = new CacheRedis();

const {
  favoriteRepository,
} = require("../../src/repositories");

const appConfig = require("../../config")();
const db = require("../../src/db")(appConfig);

class FavoriteService {

	constructor() { }

  static toggleFavorite(petition, userId) {
    return ValidationModel.validateRequest('petitionFavorite', 'ErrorPetitionVersionInvalid', petition)
      .then(() => FavoriteModel.toggleFavorite(userId, petition.id))
      .then(result => new SuccessModel('success', result))
      .catch(err => Promise.reject(new FailModel('fail', 'updateFavorite', listErrors['ErrorFavoriteUpdate'].message, listErrors['ErrorFavoriteUpdate'].errorCode)))
  }

  static favoriteInfo(petitionId, { userId } = {}) {
    return favoriteRepository(db).findByPetitionIdAndUser({ petitionId, userId})
      .then(favorite => new SuccessModel('success', { favorite }))
      .catch(err => Promise.reject(new FailModel('fail', 'getFavoriteInfo', listErrors['ErrorFavoriteInfo'].message, listErrors['ErrorFavoriteInfo'].errorCode)))
  }
}

module.exports = FavoriteService;
