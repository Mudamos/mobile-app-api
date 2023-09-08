var _ = require('lodash')
  , Connection = require('../../../config/initializers/database')
  , LogModel = require('../../../libs/models/log/log')
  , ErrorModel = require('../../../libs/models/response/error')
  , validator = require('validator')
  , ValidationModel = require('../../../libs/models/response/validation')
  , ValidateAttribute = require('../../../libs/models/validate/attribute')
  , listErrors = require('../../../libs/helpers/errors-list')
  , sign = require('../../../libs/helpers/sign')
  , facebook = require('../../../libs/helpers/facebook')
  , User = require('../../../libs/helpers/user')
  , config = require('nconf');

const shouldSkipMobileNumber = /^true$/i.test(config.get("MOBILE_STATUS") || "");

class Vote {

  constructor() { }

  static createVote(signMessage) {
    const query = `
      CALL SP_INSERT_VOTE(@id, ?, ? , ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); SELECT @id as id;
    `;

    const { latitude, longitude } = signMessage.userCurrentCoordinates || {};
    const voteStatus = 0;
    const replacements = [
      signMessage.petitionId,
      signMessage.signature,
      signMessage.walletId,
      voteStatus,
      signMessage.voteIdCard,
      signMessage.message,
      signMessage.geoloc,
      shouldSkipMobileNumber ? null : signMessage.userMobileNumber,
      signMessage.userState,
      signMessage.userUf,
      signMessage.userCityName,
      signMessage.userDistrict,
      signMessage.userCityId,
      latitude,
      longitude,
      signMessage.deviceId,
      signMessage.deviceUniqueId,
      signMessage.appVersion,
    ];

    return new Promise((resolve, reject) => {
      const connection = new Connection();

      connection.getConnection(err => err && reject(err), conn => {
        conn.query(query, replacements, (error, rows, fields) => {
          conn.release();

          if (error || (rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))) {
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('petition', rows[0][0].msg)], listErrors['ErrorSignMessageDuplicate'].errorCode));
          } else {
            resolve(Vote.findById(_.first(rows[1]).id));
          }
        })
      });
    });
  };

  static findById(id) {
    var query = 'SELECT * FROM vote WHERE Id = ?';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id], function (error, rows, fields) {
          conn.release();
          resolve(_.first(rows));
        });
      })
    })
  }

  static findByUserId(plipIds, voteIdCard) {
    const query = `
      SELECT
        v.Create AS vote_create,
        p.IdPetition AS petition_id,
        p.IdVersion AS version_id
      FROM vote v
      JOIN petition AS p ON p.Id = v.PetitionId
      WHERE
        v.VoteIdCard = ? AND v.PetitionId IN (?)
      ORDER BY v.PetitionId DESC`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [voteIdCard, plipIds], function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    })
  }


  static findByIdInfo(plipId, { cityName, uf } = {}) {
    let replacements = [plipId];
    let query = `
      SELECT
        p.BlockStamp AS updatedAt,
        COUNT(*) AS signaturesCount,
        p.TxId AS blockchainaddress
      FROM
        vote AS v
      JOIN
        petition AS p ON p.Id = v.PetitionId
      WHERE
        p.IdPetition = ?`;

    if (uf) {
      query += ` AND v.uf = ?`;
      replacements = [...replacements, uf];
    }

    if (cityName) {
      query += ` AND v.cityName = ?`;
      replacements = [...replacements, cityName];
    }

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query, replacements, (error, rows, fields) => {
          conn.release();
          resolve(_.first(rows));
        });
      })
    });
  }

  static findVersionById(plipId) {
    var query = `SELECT
                    p.IdVersion AS petition_version,
                    p.Create AS petition_updatedat,
                    p.BlockStamp AS petition_blockstamp,
                    p.Name AS petition_name,
                    p.DigSig AS petition_signature,
                    p.PageUrl AS petition_page_url,
                    p.Url AS petition_pdf_url
                FROM
                  petition AS p
                WHERE
                  p.IdPetition = ? AND p.Status = 1
                ORDER BY
                  p.BlockStamp DESC`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [plipId], function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    })
  }

  static findByIdVersionInfo(versionId, { cityName, uf } = {}) {
    let replacements = [versionId];
    let query = `
      SELECT
        p.BlockStamp AS updatedAt,
        COUNT(*) AS signaturesCount,
        p.TxId AS blockchainaddress
      FROM
        vote AS v
      JOIN
        petition AS p ON p.Id = v.PetitionId
      WHERE
        p.IdPetition = (SELECT
                          IdPetition
                        FROM
                          petition
                        WHERE
                          IdVersion = ?)`;

    if (uf) {
      query += ` AND v.uf = ?`;
      replacements = [...replacements, uf];
    }

    if (cityName) {
      query += ` AND v.cityName = ?`;
      replacements = [...replacements, cityName];
    }

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query, replacements, (error, rows, fields) => {
          conn.release();
          resolve(_.first(rows));
        });
      })
    })
  }

  static findByIdAndLimitRecords(versionId, limit, status) {
    var query = `SELECT
                  v.Create AS vote_date,
                  u.Name AS user_name,
                  u.City AS user_city,
                  u.State AS user_state,
                  u.UF AS user_uf,
                  p.Type AS profile_type,
                  p.ProfileId AS profile_id,
                  p.Email AS profile_email,
                  p.Picture AS profile_picture
                FROM
                  vote AS v
                JOIN
                  user AS u ON u.VoteIdCard = v.VoteIdCard
                JOIN
                  user_profile AS up ON up.UserId = u.Id
                JOIN
                  profile AS p ON p.Id = up.ProfileId
                JOIN
                  petition AS pt ON pt.Id = v.PetitionId
                WHERE
                  v.PetitionId = (SELECT
                                    Id
                                  FROM
                                    petition
                                  WHERE
                                    IdVersion = ?)
                  AND pt.Status IN (?)
                GROUP BY u.VoteIdCard
                ORDER BY v.Id DESC
                LIMIT ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [versionId, status, parseInt(limit, 10)], function (error, rows, fields) {
          conn.release();
          _.each(rows, function (row) {
            row.profile_picture = facebook.generateImgLink(row.profile_picture ? row.profile_picture : null, row.profile_type, row.profile_id, 'small');
          })
          resolve(rows);
        });
      })
    })
  }

  static findAll() {
    var resultRows = [];
    var query = `SELECT
                  v.Id AS vote_id,
                  v.Create AS vote_create,
                  v.Signature AS vote_signature,
                  v.WalletId AS vote_walletId,
                  v.Message AS vote_message,
                  u.Name AS user_name,
                  u.VoteIdCard AS user_voteidcard,
                  u.ZipCode AS user_zipcode,
                  u.State AS user_state,
                  u.UF AS user_uf,
                  u.City AS user_city,
                  u.District AS user_district,
                  p.Name AS petition_name,
                  p.Id AS petition_id,
                  v.WalletId AS wallet_key
                FROM
                  vote AS v
                JOIN
                  user AS u ON u.VoteIdCard = v.VoteIdCard
                  AND NOT u.Validate IS NULL
                JOIN
                  petition AS p ON p.Id = v.PetitionId AND p.Status = 1
                ORDER BY p.Id`;

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

  static async findAllPDFGroup()
  {
    const query = `
      SELECT
        p.IdPetition
      FROM vote AS v
      JOIN user AS u ON u.VoteIdCard = v.VoteIdCard
      JOIN petition AS p ON p.Id = v.PetitionId
      WHERE
        p.Status = 1
      GROUP BY p.IdPetition;`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('petition', rows[0][0].msg)], listErrors['ErrorSignMessageDuplicate'].errorCode);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          resolve(rows || []);
        })
      })
    })
  }

  static async findAllPDF() {
    const query = `
      SELECT
        v.Message AS vote_message,
        p.IdPetition AS petition_id,
        v.Id AS vote_id,
        v.Signature as link_vote_signature,
        p.Name AS petition_name,
        p.PageUrl AS petition_page_url,
        p.TxStamp AS petition_tx_stamp,
        p.DigSig AS petition_dig_sig,
        v.State AS user_state,
        v.UF AS user_uf,
        v.CityName AS user_city,
        v.District AS user_district
      FROM vote AS v
      JOIN user AS u ON u.VoteIdCard = v.VoteIdCard
      JOIN petition AS p ON p.Id = v.PetitionId
      WHERE
        p.Status = 1
      ORDER BY
        v.State ASC,
        v.UF ASC,
        v.CityName ASC,
        v.District collate utf8_bin ASC,
        u.Name ASC;`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('petition', rows[0][0].msg)], listErrors['ErrorSignMessageDuplicate'].errorCode);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          _.each(rows, row => {
            row.link_vote_signature = `${config.get('PDF_SIGNATURE_VALIDATION_URL')}/${sign.toHex(row.link_vote_signature)}`
          })
          resolve(rows || []);
        })
      })
    })
  }

  static async findAllPDFByPetition(petitionsId) {
    const query = `
      SELECT
        v.Message AS vote_message,
        v.Id AS vote_id,
        v.Signature as link_vote_signature,
        v.State AS user_state,
        v.UF AS user_uf,
        v.CityName AS user_city,
        v.District AS user_district
      FROM vote AS v
      JOIN user AS u ON u.VoteIdCard = v.VoteIdCard
      WHERE
        v.PetitionId IN (?)
      ORDER BY
        v.State ASC,
        v.UF ASC,
        v.CityName ASC,
        v.District collate utf8_bin ASC,
        u.Name ASC;`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          throw new ValidationModel('fail', 'validation', listErrors['ErrorSignMessage'].message, [new ValidateAttribute('petition', rows[0][0].msg)], listErrors['ErrorSignMessageDuplicate'].errorCode);
        }
      }, function (conn) {
        conn.query(query,[petitionsId], function (error, rows, fields) {
          conn.release();
          _.each(rows, row => {
            row.link_vote_signature = `${config.get('PDF_SIGNATURE_VALIDATION_URL')}/${sign.toHex(row.link_vote_signature)}`
          })
          resolve(rows || []);
        })
      })
    })
  }

  static async findAllPDFByRangeAndPetition(petition_id, start_range, qtd_range) {
    const query = `
      SELECT
        v.Message AS vote_message,
        v.PetitionId AS petition_id,
        v.Id AS vote_id,
        v.Signature as link_vote_signature,
        p.Name AS petition_name,
        p.PageUrl AS petition_page_url,
        p.TxStamp AS petition_tx_stamp,
        p.DigSig AS petition_dig_sig,
        v.State AS user_state,
        v.UF AS user_uf,
        v.CityName AS user_city,
        v.District AS user_district
      FROM vote AS v
      JOIN user AS u ON u.VoteIdCard = v.VoteIdCard
      JOIN petition AS p ON p.Id = v.PetitionId AND p.Status = 1 AND v.PetitionId in (?)
      ORDER BY
        v.State ASC,
        v.UF ASC,
        v.CityName ASC,
        v.District collate utf8_bin ASC,
        u.Name ASC,
        v.PetitionId DESC
      LIMIT ?,?`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query,[petition_id,start_range,qtd_range], function (error, rows, fields) {
          conn.release();
          _.each(rows, row => {
            row.link_vote_signature = `${config.get('PDF_SIGNATURE_VALIDATION_URL')}/${sign.toHex(row.link_vote_signature)}`
          })
          resolve(rows || []);
        })
      })
    })
  }

  static async findBySignatures(signatures) {
    var query = `SELECT
                  Id AS vote_id,
                  Signature AS vote_signature
                FROM
                  vote
                WHERE
                  Signature IN (${signatures.join(',')})`;
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

  static updateVotesStatus(ids) {
    var query = `UPDATE vote SET status = 1 WHERE Id IN (${ids.join(',')})`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
            resolve(true);
        });
      })
    })
  }

  static updateBlockchainProcess(batchId) {
    var query = 'CALL SP_UPDATE_VOTE_BLOCKCHAIN(?);';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [batchId], function (error, rows, fields) {
          conn.release();
          resolve(true);
        });
      });
    })
  }

  static findFriendsByPetition(userId, petitionId, lat, lng, distance, limit, unit, facebookFriends) {
    facebookFriends = facebookFriends.length ? facebookFriends : [0]
    var query = `SELECT * FROM (
                  SELECT
                    u.Id AS user_id ,
                    u.Name AS user_name,
                    v.Create AS vote_date,
                    p.Type AS profile_type,
                    p.ProfileId AS profile_id ,
                    p.Picture as profile_picture
                  FROM
                    user AS u
                  JOIN
                    vote AS v ON v.PetitionId = (SELECT
                                    Id
                                  FROM
                                    petition
                                  WHERE
                                    IdVersion = ?)  AND v.VoteIdCard = u.VoteIdCard
                  JOIN
                    user_profile AS up ON up.UserId = u.Id
                  JOIN
                    profile AS p ON p.Id = up.ProfileId
                  WHERE
                     p.ProfileId IN (?)
                    AND not u.Lat is null
                    AND not u.Lng is null
                    AND ((? * acos(cos(radians(?)) * cos(radians(u.Lat)) * cos(radians(u.Lng) - radians(?)) + sin(radians(?)) * sin(radians(u.Lat))))) < ?
                UNION ALL
                  SELECT
                    u.Id AS user_id ,
                    u.Name AS user_name,
                    v.Create AS vote_date,
                    p.Type AS profile_type,
                    p.ProfileId AS profile_id ,
                    p.Picture as profile_picture
                  FROM
                    user AS u
                  JOIN
                    vote AS v ON   v.PetitionId = (SELECT
                                    Id
                                  FROM
                                    petition
                                  WHERE
                                    IdVersion = ?)  AND v.VoteIdCard = u.VoteIdCard
                  JOIN
                    user_profile AS up ON up.UserId = u.Id
                  JOIN
                    profile AS p ON p.Id = up.ProfileId
                  WHERE
                     NOT p.ProfileId IN (?)
                  LIMIT ? ) friends
              ORDER BY
                friends.user_id;`
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [parseInt(petitionId, 10), facebookFriends, parseInt(unit, 10), lat, lng, lat, parseInt(distance, 10), petitionId, userId, parseInt(limit, 10)], function (error, rows, fields) {
          conn.release();
          if (rows) {
            _.each(rows, (row) => {
              row.profile_picture = facebook.generateImgLink(row.profile_picture, row.profile_type, row.profile_id, 'small')
            })
            resolve(rows);
          }else{
            resolve(null);
          }
        });
      });
    })
  }

  static findFriendsRandonByPetition(userId, petitionId, limit) {

    var query = `
    set @mx = (SELECT FLOOR( MAX(id) * RAND()) FROM user);
    SELECT
      u.Id AS user_id,
      u.Name AS user_name,
      v.Create AS vote_date,
      p.Type AS profile_type,
      p.ProfileId AS profile_id,
      p.Picture AS profile_picture
    FROM
      user AS u
    JOIN
      vote AS v ON v.VoteIdCard = u.VoteIdCard
    JOIN
      user_profile AS up ON up.UserId = u.Id
    JOIN
      profile AS p ON p.Id = up.ProfileId
    WHERE  v.PetitionId = (SELECT
                        Id
                      FROM
                        petition
                      WHERE
                        IdVersion = ?) and u.Id != ? and u.Id > @mx
    LIMIT ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [petitionId, userId, parseInt(limit, 10)]
          , function (error, rows, fields) {
            conn.release();
            if (rows[1]) {
              _.each(rows[1], (row) => {
                row.profile_picture = facebook.generateImgLink(row.profile_picture, row.profile_type, row.profile_id, 'small')
              })
              resolve(rows[1]);
            }
          });
      });
    })
  }

  static findBySignaturesPetitionBlockchain(signature) {
    var query = `SELECT
                  p.Name AS petition_name,
                  p.PageUrl AS petition_page_url,
                  max(b.BlockStamp) AS blockchain_updatedat,
                  b.FIle AS signatures_pdf_url,
                  v.Create AS updatedat,
                  u.Name AS user_name
                FROM
                  vote AS v
                JOIN
                  user AS u ON u.VoteIdCard = v.VoteIdCard
                JOIN
                  petition AS p ON p.Id = v.PetitionId AND p.Status = 1
                JOIN
                  batch_vote AS bv ON bv.VoteId = v.Id
                JOIN
                  batch AS b ON b.Id = bv.BatchId
                WHERE
                  v.Signature IN (?)
                  AND v.Status = 1
                  AND b.Status = 1`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [signature], function (error, rows, fields) {
          conn.release();
          _.each(rows, (row) => {
            if(row){
              var splitURL = row.signatures_pdf_url ? row.signatures_pdf_url.split('/') : '';
              if(splitURL != ''){
                splitURL[splitURL.length-1] = `anonymised/${splitURL[splitURL.length-1]}`;
                splitURL = splitURL.join('/');
              }
              row.user_name = User.getNameAnonymised(row.user_name || '', 'X');
              row.signatures_pdf_url = `${config.get('AWS_URL')}/${config.get('AWS_BUCKET')}${splitURL}`;
            }
          })
          resolve(_.first(rows));
        });
      })
    })
  }
}

module.exports = Vote;
