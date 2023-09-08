var _ = require('lodash')
  , bcrypt = require('bcrypt')
  , listErrors = require('../../libs/helpers/errors-list')
  , UserModel = require('../models/user/user')
  , FailModel = require('../../libs/models/response/fail')
  , CacheRedis = require('../../config/initializers/cache-redis')
  , Cache = new CacheRedis()
  , NotificationService = require('./notification')
  , UserService = require('./user')
  , ValidationModel = require('../../libs/models/response/validation')
  , SuccessModel = require('../../libs/models/response/success')
  , LogModel = require('../../libs/models/log/log')
  , TraceModel = require('../../libs/models/log/trace')
  , AccessModel = require('../../libs/models/log/access')
  , BlackListService = require('./blacklist')

class AuthService {
  constructor() { }

  static login(username, password, token) {
    var _user;
    return UserModel.findByEmailAndPassword(username)
      .then(user => {
        _user = user;
        if(!_user){
          return false;
        }else{
          return BlackListService.verifyLogin(user);
        }
      })
      .then(blacklist => {
        if (blacklist) {
          throw new FailModel('fail', 'authentication', listErrors['ErrorUserBlackList'].message, listErrors['ErrorUserBlackList'].errorCode);
        } else {
          return _user;
        }
      })
      .then(user => {
        if ((!user || user.user_password == null) || (user.user_password !== null && !bcrypt.compareSync(password, user.user_password))) {
          if(user){
            AccessModel.access('SIGN-APP', user.user_id, token.access_token, 1);
          }
          throw new FailModel('fail', 'authentication', listErrors['ErrorUserPassword'].message, listErrors['ErrorUserPassword'].errorCode);
        } else {
          delete user.user_password;
          return user;
        }
      })
      .then(user => {
        AccessModel.access('SIGN-APP', user.user_id, token.access_token, 0);
        return Cache.setKey(token.access_token, JSON.stringify(user))
      })
  }

  static logout(access_token) {
    var _token = access_token.split(' ');
    return ValidationModel.validateRequest('accessToken', 'ErrorAccessToken', { access_token: _token[1], token_type: _token[0] })
      .then(validate => {
        return Cache.deleteKeySync(_token[1]);
      })
      .then(success => {
        return new SuccessModel('success', { 'logout': true });
      })
  }
}

module.exports = AuthService;
