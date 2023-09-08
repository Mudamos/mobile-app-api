var _ = require('lodash')
  , validator = require('validator')
  , listErrors = require('../../../libs/helpers/errors-list')
  , Connection = require('../../../config/initializers/database')
  , UserModel = require('../user/user')
  , ValidationModel = require('../../../libs/models/response/validation')
  , ValidateAttribute = require('../../../libs/models/validate/attribute');

class Wallet {

  constructor(walletid, status) {
    this.walletid = walletid;
    this.status = status;
  }

  static insertUserWallet(user) {
    var query = 'CALL SP_INSERT_WALLET(?, ?, ?)';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.walletKey, user.user_id, 1], function (error, rows, fields) {
          conn.release();
          if (rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorWalletDuplicate'].message, [new ValidateAttribute('walletKey', rows[0][0].msg)], listErrors['ErrorWalletDuplicate'].errorCode))
          else
            resolve(UserModel.findById(user.user_id))
        });
      });
    });
  };

  static getWalletByUserId(id) {
    var query = `SELECT UserId, WalletId, Status FROM user_wallet WHERE UserId = ? AND Status = ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id, 1], function (error, rows, fields) {
          conn.release();
          resolve(_.first(rows));
        });
      });
    });
  };
}

module.exports = Wallet;
