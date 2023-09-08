var _ = require('lodash')
  , moment = require('moment')
  , validator = require('validator')
  , listErrors = require('../../../libs/helpers/errors-list')
  , Connection = require('../../../config/initializers/database')
  , ValidationModel = require('../../../libs/models/response/validation')
  , ValidateAttribute = require('../../../libs/models/validate/attribute')
  , queryBuilder = require("../../../src/db/query-builder")
  , URL = require('url').URL;

const { isBlank } = require("../../../src/utils");

const buildUserPictureUrl = ({ profile_picture: picture, picture_updated_at: date }) => {
  if (isBlank(picture)) return;

  const url = new URL(picture);
  url.searchParams.append("updatedAt", moment(date).format("x"));

  return url.toString();
};

const buildDefaultSelectQuery = () => {
  const { raw } = queryBuilder;

  return queryBuilder({ u: "user"})
    .select({
      user_id: "u.Id",
      user_name: "u.Name",
      user_birthday: raw("DATE_FORMAT(u.Birthday,\'%Y-%m-%d\')"),
      user_voteidcard: "u.VoteIdCard",
      user_cpf: "u.CPF",
      user_zipcode: "u.ZipCode",
      user_state: "u.State",
      user_uf: "u.UF",
      user_lat: "u.Lat",
      user_lng: "u.Lng",
      user_city: "u.City",
      user_district: "u.District",
      user_validate: raw("DATE_FORMAT(u.Validate, \'%Y-%m-%dT%TZ\')"),
      terms_accepted: "u.TermsAccepted",
      user_wallet_id: "uw.Id",
      wallet_key: "uw.WalletId",
      wallet_status: "uw.Status",
      mobile_id: "m.Id",
      mobile_status: "m.Status",
      mobile_number: "m.Number",
      mobile_imei: "m.Imei",
      mobile_brand: "m.Brand",
      mobile_model: "m.Model",
      mobile_so: "m.SO",
      mobile_so_version: "m.SOVersion",
      mobile_screensize: "m.ScreenSize",
      profile_type: "p.Type",
      profile_email: "p.Email",
      profile_id: "p.ProfileId",
      profile_picture: "p.Picture",
      has_saved_avatar: raw("p.Picture IS NOT NULL"),
      picture_updated_at: "p.PictureUpdatedAt",
      voteCityId: "voteCity.id",
      voteCityName: "voteCity.name",
      voteCityUf: "voteCity.uf",
    })
    .leftJoin({ uw: "user_wallet" }, "u.Id", "uw.UserId")
    .leftJoin({ um: "user_mobile" }, "u.Id", "um.UserId")
    .leftJoin({ m: "mobile" }, "m.Id", "um.MobileId")
    .leftJoin({ up: "user_profile" }, "u.Id", "up.UserId")
    .leftJoin({ p: "profile" }, "up.ProfileId", "p.Id")
    .leftJoin({ voteCity: "city" }, "voteCity.id", "u.voteCityId")
    .orderBy("u.Id", "desc")
    .orderBy("m.Id", "desc")
    .orderBy("uw.Id", "desc")
    .orderBy("p.Type", "desc")
}

const convertUser = user => {
  if (!user) {
    return null;
  }

  return Object.assign(user, {
    has_saved_avatar: Boolean(user.has_saved_avatar),
    mobile_status: Boolean(user.mobile_status),
    profile_picture: buildUserPictureUrl(user),
    terms_accepted: Boolean(user.terms_accepted),
    wallet_status: Boolean(user.wallet_status),
  });
}

class User {

  constructor() { }

  static createUserLogin(user) {
    const userQuery = `INSERT INTO user (CPF, Password, TermsAccepted) VALUES (?, ?, ?)`;
    const profileQuery = `INSERT INTO profile (Email, Type, Status, ProfileId, Picture) VALUES (?, ?, ?, ?, ?)`;
    const userProfileQuery = `INSERT INTO user_profile (UserId, ProfileId) VALUES (?, ?)`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.beginTransaction(function(err) {
          if (err) {
            return conn.rollback(function() {
              conn.release();
              reject(err);
            });
          }

          conn.query(userQuery, [user.cpf, user.hashPassCrypth, user.termsAccepted], function (err, rows, fields) {
            if (err) {
              return conn.rollback(function() {
                conn.release();
                reject(err);
              });
            }

            const userId = rows.insertId;
            const profileStatus = 1;
            conn.query(profileQuery, [user.email, 'app', profileStatus, userId, user.picture], function (err, rows, fields) {
              if (err) {
                return conn.rollback(function() {
                  conn.release();
                  reject(err);
                });
              }

              const profileId = rows.insertId;
              conn.query(userProfileQuery, [userId, profileId], function (err, rows, fields) {
                if (err) {
                  return conn.rollback(function() {
                    conn.release();
                    reject(err);
                  });
                }

                conn.commit(function(err) {
                  if (err) {
                    return conn.rollback(function() {
                      conn.release();
                      reject(err);
                    });
                  }
                  conn.release();

                  resolve(User.findById(userId));
                });
              });
            });
          });
        });
      });
    });
  };

  static updateUserLogin(user, user_cache) {
    const userQuery = `UPDATE user SET CPF=?, TermsAccepted=? WHERE Id=?`;
    const profileQuery = `UPDATE profile SET Email=? WHERE ProfileId=?`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.beginTransaction(function(err) {
          if (err) {
            return conn.rollback(function() {
              conn.release();
              reject(err);
            });
          }

          conn.query(userQuery, [user.cpf, user.termsAccepted, user_cache.user_id], function (err, rows, fields) {
            if (err) {
              return conn.rollback(function() {
                conn.release();
                reject(err);
              });
            }

            if (user.email) {
              conn.query(profileQuery, [user.email, user_cache.profile_id], function (err, rows, fields) {
                if (err) {
                  return conn.rollback(function() {
                    conn.release();
                    reject(err);
                  });
                }
              });
            }

            conn.commit(function(err) {
              if (err) {
                return conn.rollback(function() {
                  conn.release();
                  reject(err);
                });
              }
              conn.release();

              resolve(User.findById(user_cache.user_id));
            });
          });
        });
      });
    });
  };

  static updateValidate(user, validate) {
    var query = 'UPDATE user SET Validate = ? WHERE Id = ?';
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
    const query = buildDefaultSelectQuery()
      .where("u.Id", id)
      .limit(1);

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query.toString(), (error, rows, fields) => {
          conn.release();
          const [user] = rows;

          resolve(convertUser(user));
        });
      })
    });
  }

  static findByVoteCardId(voteCard) {
    const query = buildDefaultSelectQuery()
      .where("u.VoteIdCard", voteCard)
      .limit(1);

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query.toString(), (error, rows, fields) => {
          conn.release();
          const [user] = rows;

          resolve(convertUser(user));
        });
      })
    });
  };

  static findByCpf(cpf) {
    const query = buildDefaultSelectQuery()
      .where("u.CPF", cpf)
      .limit(1);

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query.toString(), (error, rows, fields) => {
          conn.release();
          const [user] = rows;

          resolve(convertUser(user));
        });
      })
    });
  };

  static findByEmail(email) {
    const query = buildDefaultSelectQuery()
      .where("p.Email", email)
      .limit(1);

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query.toString(), (error, rows, fields) => {
          conn.release();
          const [user] = rows;

          resolve(convertUser(user));
        });
      })
    });
  };

  static findByEmailOrProfile(email, profileId) {
    const query = buildDefaultSelectQuery();

    if (email) {
      query.orWhere("p.Email", email);
    }

    if (profileId) {
      query.orWhere("p.ProfileId", profileId);
    }

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query.toString(), (error, rows, fields) => {
          conn.release();

          if (rows && rows.length) {
           resolve(rows.map(convertUser));
          } else {
            resolve(null);
          }
        });
      })
    });
  };

  static findPetitions({ voteCardId }) {
    const { raw } = queryBuilder;

    const getPetitionsSigned = queryBuilder("petition")
      .select("petition.id", "petition.idPetition")
      .join("vote", "petition.id", "=", "vote.petitionId")
      .where("vote.voteIdCard", voteCardId)
      .groupBy('petition.idPetition')
      .as("userPetitionVotes");

    const queryFindPetitions = queryBuilder("petition")
      .distinct("petition.idPetition", raw("IF(userPetitionVotes.id IS NULL, 'false', 'true') as hasVoted"))
      .leftJoin(getPetitionsSigned, "petition.idPetition", "userPetitionVotes.idPetition")
      .where("petition.status", true)
      .where(builder =>
        builder.whereNull("userPetitionVotes.id")
          .orWhere(raw("userPetitionVotes.id = petition.id"))
      )
      .orderBy("petition.idPetition", "asc")

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(err => {
        err && reject(err);
      }, conn => {
        conn.query(queryFindPetitions.toString(), [voteCardId], (error, rows, fields) => {
          conn.release();
         if (rows && rows.length) {
            resolve(rows);
          } else {
            resolve([]);
          }
        });
      })
    });
  };
}

module.exports = User;
