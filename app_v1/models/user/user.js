var _ = require('lodash')
  , moment = require('moment')
  , validator = require('validator')
  , listErrors = require('../../../libs/helpers/errors-list')
  , Connection = require('../../../config/initializers/database')
  , ValidationModel = require('../../../libs/models/response/validation')
  , ValidateAttribute = require('../../../libs/models/validate/attribute')
  , URL = require('url').URL;

const { isBlank } = require("../../../src/utils");

const buildUserPictureUrl = ({ profile_picture: picture, picture_updated_at: date }) => {
  if (isBlank(picture)) return;

  const url = new URL(picture);
  url.searchParams.append("updatedAt", moment(date).format("x"));

  return url.toString();
};

class User {

  constructor() { }


   static addUserFacebookProfile(user) {
    var query = 'CALL SP_INSERT_USER_FACEBOOK_PROFILE(@id, ?, ?, ?, ?); SELECT @id as id;';

    user.profile_email = !user.profile_email || user.profile_email == '' ? user.profile_id : user.profile_email;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.user_id, user.profile_email, user.profile_id, user.profile_picture], function (error, rows, fields) {
          conn.release();
          if (rows && rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCreate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserCreate'].errorCode));
          else if (rows[1].length) {
            resolve(User.findById(_.first(rows[1]).id));
          }
        });
      })
    });
  };

  static createUserFacebook(user) {
    var query = 'CALL SP_INSERT_USER_FACEBOOK(@id, ?, ?, ?, ?); SELECT @id as id;';

    user.profile_email = !user.profile_email || user.profile_email == '' ? user.profile_id : user.profile_email;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.user_name, user.profile_email, user.profile_id, user.profile_picture], function (error, rows, fields) {
          conn.release();
          if (rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCreate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserCreate'].errorCode));
          else if (rows[1].length) {
            resolve(User.findById(_.first(rows[1]).id));
          }
        });
      })
    });
  };

  static createUserLogin(user) {
    var query = 'CALL SP_INSERT_USER(@id, ?, ?, ?, ?);  SELECT @id as id;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.name, user.email, user.hashPassCrypth, user.picture], function (error, rows, fields) {
          conn.release();
          if (rows && rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCreate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserCreate'].errorCode));
          else
            resolve(User.findById(_.first(rows[1]).id))
        });
      });
    });
  };

  static createUserLoginMudamos(user) {
    var query = 'CALL SP_INSERT_USER_MUDAMOS(@id, ?, ?, ?, ? , ?);  SELECT @id as id;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.name, user.email, user.hashPassCrypth, user.picture, user.birthday], function (error, rows, fields) {
          conn.release();
          if (rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCreate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserCreate'].errorCode));
          else
            resolve(User.findById(_.first(rows[1]).id));
        });
      });
    });
  };

  static updateUserLogin(user, user_cache) {
    var query = 'CALL SP_UPDATE_USER_LOGIN(?, ? , ?, ?, ?)'
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.name, user_cache.profile_email, user.email, user_cache.user_id, user_cache.profile_id], function (error, rows, fields) {
          conn.release();
          user_cache.user_name = user.name;
          user_cache.profile_email = user.email;
          resolve(user_cache);
        });
      })
    });
  }

  static updateValidate(user, validate) {
    var query = 'UPDATE user SET Validate = ?  WHERE Id = ?';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [validate, user.user_id], function (error, rows, fields) {
          conn.release();
          if (rows.affectedRows) {
            user.user_validate = null;
          }
          resolve(user);
        });
      });
    });
  };

  static findById(id) {
    var query = `
      SELECT
        voteCity.id as voteCityId,
        voteCity.name as voteCityName,
        voteCity.uf as voteCityUf,
        u.Id AS user_id,
        u.Name AS user_name,
        DATE_FORMAT(u.Birthday, '%Y-%m-%d') AS user_birthday,
        u.VoteIdCard AS user_voteidcard,
        u.CPF AS user_cpf,
        u.ZipCode AS user_zipcode,
        u.State AS user_state,
        u.UF as user_uf,
        u.Lat as user_lat,
        u.Lng as user_lng,
        u.City as user_city,
        u.District as user_district,
        c.id as user_city_id,
        DATE_FORMAT(u.Validate, '%Y-%m-%dT%TZ') AS user_validate,
        u.TermsAccepted AS terms_accepted,
        uw.Id AS user_wallet_id,
        uw.WalletId AS wallet_key,
        uw.Status AS wallet_status,
        m.Id AS mobile_id,
        m.Status AS mobile_status,
        m.Number AS mobile_number,
        m.Imei AS mobile_imei,
        m.Brand AS mobile_brand,
        m.Model AS mobile_model,
        m.SO AS mobile_so,
        m.SOVersion AS mobile_so_version,
        m.ScreenSize AS mobile_screensize,
        p.Type AS profile_type,
        p.Email AS profile_email,
        p.ProfileId AS profile_id,
        p.Picture AS profile_picture,
        p.IsAvatar AS has_saved_avatar,
        p.PictureUpdatedAt as picture_updated_at

      FROM user as u

      LEFT JOIN user_wallet as uw ON u.Id = uw.UserId
      LEFT JOIN user_mobile as um ON u.Id = um.UserId
      LEFT JOIN mobile as m ON m.Id = um.MobileId
      LEFT JOIN user_profile as up ON u.id = up.UserId
      LEFT JOIN profile as p ON up.ProfileId = p.Id
      LEFT JOIN city c ON c.uf = u.uf AND (c.name = u.city or c.otherNames like CONCAT('%', u.city, ';%'))
      LEFT JOIN city voteCity ON voteCity.id = u.voteCityId

      WHERE
        u.Id = ?

      ORDER BY
        u.Id desc,
        m.Id desc,
        p.Type desc,
        uw.Id desc
      LIMIT 1;`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id], function (error, rows, fields) {
          conn.release();
          if (rows.length) {
            _.first(rows).terms_accepted = Boolean(_.first(rows).terms_accepted);
            _.first(rows).mobile_status = Boolean(_.first(rows).mobile_status);
            _.first(rows).wallet_status = Boolean(_.first(rows).wallet_status);
            _.first(rows).has_saved_avatar = Boolean(_.first(rows).has_saved_avatar);
            _.first(rows).profile_picture = buildUserPictureUrl(_.first(rows));
            resolve(_.first(rows));
          } else {
            resolve(null);
          }
        });
      })
    });
  }

  static findByEmail(email) {
    var query = `SELECT voteCity.id as voteCityId, voteCity.name as voteCityName, voteCity.uf as voteCityUf, u.Id AS user_id, u.Name AS user_name, DATE_FORMAT(u.Birthday,\'%Y-%m-%d\') AS user_birthday,u.VoteIdCard AS user_voteidcard,u.CPF AS user_cpf,u.ZipCode AS user_zipcode, u.State AS user_state, u.UF as user_uf, u.Lat as user_lat, u.Lng as user_lng, u.City as user_city , u.District  as user_district, DATE_FORMAT(u.Validate, \'%Y-%m-%dT%TZ\') AS user_validate, u.TermsAccepted AS terms_accepted, uw.Id AS user_wallet_id, uw.WalletId AS wallet_key,uw.Status AS wallet_status, m.Id AS mobile_id, m.Status AS mobile_status,m.Number AS mobile_number,m.Imei AS mobile_imei,m.Brand AS mobile_brand,m.Model AS mobile_model,m.SO AS mobile_so,m.SOVersion AS mobile_so_version,m.ScreenSize AS mobile_screensize, p.Type AS profile_type,p.Email AS profile_email,p.ProfileId AS profile_id, p.Picture AS profile_picture, p.IsAvatar AS has_saved_avatar, p.PictureUpdatedAt as picture_updated_at FROM user as u LEFT JOIN user_wallet as uw ON u.Id=uw.UserId LEFT JOIN user_mobile as um ON u.Id=um.UserId LEFT JOIN mobile as m ON m.Id=um.MobileId LEFT JOIN user_profile as up ON u.id=up.UserId LEFT JOIN profile as p ON up.ProfileId=p.Id LEFT JOIN city voteCity ON voteCity.id = u.voteCityId WHERE p.email = ?  ORDER BY u.Id desc ,  m.Id  desc , uw.Id desc LIMIT 1;`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [email], function (error, rows, fields) {
          conn.release();
          if (rows.length) {
            _.first(rows).terms_accepted = Boolean(_.first(rows).terms_accepted);
            _.first(rows).mobile_status = Boolean(_.first(rows).mobile_status);
            _.first(rows).wallet_status = Boolean(_.first(rows).wallet_status);
            _.first(rows).has_saved_avatar = Boolean(_.first(rows).has_saved_avatar);
            _.first(rows).profile_picture = buildUserPictureUrl(_.first(rows));
            resolve(_.first(rows));
          } else {
            resolve(null);
          }
        });
      })
    });
  };

  static findByEmailOrProfile(email, profileId) {
    var query;

    if (email && profileId) {
      var query = `SELECT voteCity.id as voteCityId, voteCity.name as voteCityName, voteCity.uf as voteCityUf, u.Id AS user_id, u.Name AS user_name, DATE_FORMAT(u.Birthday,\'%Y-%m-%d\') AS user_birthday,u.VoteIdCard AS user_voteidcard,u.CPF AS user_cpf,u.ZipCode AS user_zipcode, u.State AS user_state, u.UF as user_uf, u.Lat as user_lat, u.Lng as user_lng, u.City as user_city , u.District  as user_district, DATE_FORMAT(u.Validate, \'%Y-%m-%dT%TZ\') AS user_validate, u.TermsAccepted AS terms_accepted, uw.Id AS user_wallet_id, uw.WalletId AS wallet_key,uw.Status AS wallet_status, m.Id AS mobile_id, m.Status AS mobile_status,m.Number AS mobile_number,m.Imei AS mobile_imei,m.Brand AS mobile_brand,m.Model AS mobile_model,m.SO AS mobile_so,m.SOVersion AS mobile_so_version,m.ScreenSize AS mobile_screensize, p.Type AS profile_type,p.Email AS profile_email,p.ProfileId AS profile_id, p.Picture AS profile_picture, p.IsAvatar AS has_saved_avatar, p.PictureUpdatedAt as picture_updated_at FROM user as u LEFT JOIN user_wallet as uw ON u.Id=uw.UserId LEFT JOIN user_mobile as um ON u.Id=um.UserId LEFT JOIN mobile as m ON m.Id=um.MobileId LEFT JOIN user_profile as up ON u.id=up.UserId LEFT JOIN profile as p ON up.ProfileId=p.Id LEFT JOIN city voteCity ON voteCity.id = u.voteCityId WHERE (p.Email = ? OR p.ProfileId = ?)  ORDER BY m.Id desc, uw.Id desc`;
    } else if (profileId) {
      var query = `SELECT voteCity.id as voteCityId, voteCity.name as voteCityName, voteCity.uf as voteCityUf, u.Id AS user_id, u.Name AS user_name, DATE_FORMAT(u.Birthday,\'%Y-%m-%d\') AS user_birthday,u.VoteIdCard AS user_voteidcard,u.CPF AS user_cpf,u.ZipCode AS user_zipcode, u.State AS user_state, u.UF as user_uf, u.Lat as user_lat, u.Lng as user_lng, u.City as user_city , u.District  as user_district, DATE_FORMAT(u.Validate, \'%Y-%m-%dT%TZ\') AS user_validate, u.TermsAccepted AS terms_accepted, uw.Id AS user_wallet_id, uw.WalletId AS wallet_key,uw.Status AS wallet_status, m.Id AS mobile_id, m.Status AS mobile_status,m.Number AS mobile_number,m.Imei AS mobile_imei,m.Brand AS mobile_brand,m.Model AS mobile_model,m.SO AS mobile_so,m.SOVersion AS mobile_so_version,m.ScreenSize AS mobile_screensize, p.Type AS profile_type,p.Email AS profile_email,p.ProfileId AS profile_id, p.Picture AS profile_picture, p.IsAvatar AS has_saved_avatar, p.PictureUpdatedAt as picture_updated_at FROM user as u LEFT JOIN user_wallet as uw ON u.Id=uw.UserId LEFT JOIN user_mobile as um ON u.Id=um.UserId LEFT JOIN mobile as m ON m.Id=um.MobileId LEFT JOIN user_profile as up ON u.id=up.UserId LEFT JOIN profile as p ON up.ProfileId=p.Id LEFT JOIN city voteCity ON voteCity.id = u.voteCityId WHERE (p.ProfileId = ?)  ORDER BY m.Id desc, uw.Id desc`;
    } else {
      var query = `SELECT voteCity.id as voteCityId, voteCity.name as voteCityName, voteCity.uf as voteCityUf, u.Id AS user_id, u.Name AS user_name, DATE_FORMAT(u.Birthday,\'%Y-%m-%d\') AS user_birthday,u.VoteIdCard AS user_voteidcard,u.CPF AS user_cpf,u.ZipCode AS user_zipcode, u.State AS user_state, u.UF as user_uf, u.Lat as user_lat, u.Lng as user_lng, u.City as user_city , u.District  as user_district, DATE_FORMAT(u.Validate, \'%Y-%m-%dT%TZ\') AS user_validate, u.TermsAccepted AS terms_accepted, uw.Id AS user_wallet_id, uw.WalletId AS wallet_key,uw.Status AS wallet_status, m.Id AS mobile_id, m.Status AS mobile_status,m.Number AS mobile_number,m.Imei AS mobile_imei,m.Brand AS mobile_brand,m.Model AS mobile_model,m.SO AS mobile_so,m.SOVersion AS mobile_so_version,m.ScreenSize AS mobile_screensize, p.Type AS profile_type,p.Email AS profile_email,p.ProfileId AS profile_id, p.Picture AS profile_picture, p.IsAvatar AS has_saved_avatar, p.PictureUpdatedAt as picture_updated_at FROM user as u LEFT JOIN user_wallet as uw ON u.Id=uw.UserId LEFT JOIN user_mobile as um ON u.Id=um.UserId LEFT JOIN mobile as m ON m.Id=um.MobileId LEFT JOIN user_profile as up ON u.id=up.UserId LEFT JOIN profile as p ON up.ProfileId=p.Id LEFT JOIN city voteCity ON voteCity.id = u.voteCityId WHERE p.Email = ? ORDER BY m.Id desc, uw.Id desc `;
    }

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        var paramns;
        if(profileId && email){
          paramns = [email, profileId || null];
        }else if(profileId){
          paramns = [profileId || null];
        }else{
          paramns = [email];
        }
        conn.query(query, paramns, function (error, rows, fields) {
          conn.release();
         if (rows.length) {
            _.each(rows, (row) => {
              row.terms_accepted = Boolean(row.terms_accepted);
              row.mobile_status = Boolean(row.mobile_status);
              row.wallet_status = Boolean(row.wallet_status);
              row.has_saved_avatar = Boolean(row.has_saved_avatar);
              _.first(rows).profile_picture = buildUserPictureUrl(_.first(rows));
            })
            resolve(rows);
          } else {
            resolve(null);
          }
        });
      })
    });
  };

  static findByEmailAndPassword(email) {
    var query = 'SELECT u.Id AS user_id, voteCity.id as voteCityId, voteCity.name as voteCityName, voteCity.uf as voteCityUf, u.Password as user_password , u.Name AS user_name,  DATE_FORMAT(u.Birthday,\'%Y-%m-%d\') AS user_birthday, u.VoteIdCard AS user_voteidcard,u.CPF AS user_cpf,u.ZipCode AS user_zipcode, u.State AS user_state, u.UF as user_uf, u.Lat as user_lat, u.Lng as user_lng, u.City as user_city , u.District  as user_district, DATE_FORMAT(u.Validate, \'%Y-%m-%dT%TZ\') AS user_validate, u.TermsAccepted AS terms_accepted, uw.Id AS user_wallet_id, uw.WalletId AS wallet_key ,uw.Status AS wallet_status, m.Id AS mobile_id, m.Status AS mobile_status,m.Number AS mobile_number,m.Imei AS mobile_imei,m.Brand AS mobile_brand,m.Model AS mobile_model,m.SO AS mobile_so,m.SOVersion AS mobile_so_version,m.ScreenSize AS mobile_screensize, p.Type AS profile_type,p.Email AS profile_email,p.ProfileId AS profile_id, p.Picture AS profile_picture, p.IsAvatar AS has_saved_avatar, p.PictureUpdatedAt as picture_updated_at FROM user as u LEFT JOIN user_wallet as uw ON u.Id=uw.UserId LEFT JOIN user_mobile as um ON u.Id=um.UserId LEFT JOIN mobile as m ON m.Id=um.MobileId LEFT JOIN user_profile as up ON u.id=up.UserId LEFT JOIN profile as p ON up.ProfileId=p.Id LEFT JOIN city voteCity ON voteCity.id = u.voteCityId WHERE p.email = ? ORDER BY m.Id desc, uw.Id desc LIMIT 1';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [email]
          , function (error, rows, fields) {
            conn.release();
            if (rows.length) {
              _.first(rows).terms_accepted = Boolean(_.first(rows).terms_accepted);
              _.first(rows).mobile_status = Boolean(_.first(rows).mobile_status);
              _.first(rows).wallet_status = Boolean(_.first(rows).wallet_status);
              _.first(rows).has_saved_avatar = Boolean(_.first(rows).has_saved_avatar);
              _.first(rows).profile_picture = buildUserPictureUrl(_.first(rows));
              resolve(_.first(rows));
            } else {
              resolve(null);
            }
          });
      })
    });
  };

  static updatePassword(user, user_cache) {
    var query = 'UPDATE user SET Password = ?  WHERE Id = ?';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.newPassword, user_cache.user_id], function (error, rows, fields) {
          conn.release();
            resolve(user_cache);
        });
      });
    });
  }

  static count(versionId) {
    var query = `select count(*) as users from user;`
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    })
  }

  static removeAccount(id){
    var query = 'CALL SP_REMOVE_ACCOUNT(?)';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id], function (error, rows, fields) {
          conn.release();
            if (!error) {
            resolve(true);
          }else{
            resolve(false);
          }
        });
      });
    });
  }

  static signNotFinished(){
    var query = `select  distinct u.name as name, p.email as email
      from user as u
      join user_profile up on up.UserId = u.id
      join profile p on p.Id = up.ProfileId
      left join user_wallet as uw on uw.UserId = u.Id
      where uw.Id is null and u.zipcode is null`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    })
  }

  static testeTimeZone(){
    var query = `select  CURRENT_TIMESTAMP;`

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    })
  }
}

module.exports = User;
