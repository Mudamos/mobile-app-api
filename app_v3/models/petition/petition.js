var _ = require('lodash')
  , config = require('nconf')
	, moment = require('moment')
  , validator = require('validator')
  , listErrors = require('../../../libs/helpers/errors-list')
  , Connection = require('../../../config/initializers/database')
  , ValidationModel = require('../../../libs/models/response/validation')
  , ValidateAttribute = require('../../../libs/models/validate/attribute')
  , queryBuilder = require("../../../src/db/query-builder")
  , appConfig = require('../../../config')();

const {
  clamp,
  contains,
  dropLast,
  flip,
  has,
  head,
  identity,
  merge,
  pipe,
} = require("ramda");

const {
  isDefaultScope,
  NATIONWIDE_COVERAGE,
  STATEWIDE_COVERAGE,
  CITYWIDE_COVERAGE,
} = require("../../../src/models").Petition;

const boolProps = ["requiresMobileValidation"];

const toPetition = attrs => {
  const parsedAttrs = {};

  boolProps.forEach(attr => {
    if (has(attr, attrs)) {
      parsedAttrs[attr] = Boolean(attrs[attr])
    }
  });

  return merge(attrs, parsedAttrs);
}

const defaultPlipsPaginated = ({ scope = "all", includeCauses = true, page = 0, limit = 10, city, uf, search, path } = {}, additionalQuery = identity) => {
  const plipsLimit = clamp(1, 10, limit);

  const isScopeAll = scope === "all";
  const isCausesOnly = scope === "causes";
  const hasIncludeCauses = includeCauses || isCausesOnly;

  const defaultQuery = queryBuilder({ pi: "petition_info" })
    .select(
      { id: "pi.VersionId" },
      { detailId: "pi.PetitionId" },
      { documentUrl: "pi.DocumentUrl" },
      { plipUrl: "pi.PetitionUrl" },
      { content: "pi.Content" },
      { presentation: "pi.Presentation" },
      { totalSignaturesRequired: "pi.TotalSignaturesRequired" },
      { callToAction: "pi.CallToAction" },
      { videoId: "pi.VideoId" },
      { shareLink: "pi.ShareLink" },
      { title: "pi.Title" },
      { subtitle: "pi.Subtitle" },
      { pictureOriginal: "pi.PictureOriginalUrl" },
      { pictureThumb: "pi.PictureThumbUrl" },
      { pictureHeader: "pi.PictureHeaderUrl" },
      { initialDate: "pi.InitialDate" },
      { finalDate: "pi.FinalDate" },
      { scopeCoverage: "pi.ScopeCoverage" },
      { uf: "pi.Uf" },
      { cityId: "pi.CityId" },
      { requiresMobileValidation: "pi.RequiresMobileValidation" },
      { cityName: "c.name" }
    )
    .leftJoin("city as c", "pi.CityId", "=", "c.Id")
    .join("petition as p", "p.IdVersion", "=", "pi.VersionId")
    .where({
      "p.Status": 1,
      "pi.Latest": 1
    })
    .orderByRaw("FIELD(pi.ScopeCoverage, \'nationwide\') DESC")
    .orderBy("InitialDate", "DESC")
    .offset(page * plipsLimit)
    .limit(plipsLimit + 1)

  const queryCauseOnly = query => query
    .where(builder =>
      builder.where(builder =>
        builder.where("pi.ScopeCoverage", STATEWIDE_COVERAGE)
          .where(builder =>
            builder.whereNull("pi.uf")
              .orWhere("pi.uf", "")
          )
        )
        .orWhere(builder =>
          builder.where("pi.ScopeCoverage", CITYWIDE_COVERAGE)
            .where(builder =>
              builder.whereNull("pi.cityId")
                .orWhere("pi.cityId", "")
            )
        )
    );

  const isMyLocaleQuery = scope === CITYWIDE_COVERAGE;

  const queryWithCauses = query => {
    if (!isDefaultScope(scope)) return query;

    if (isMyLocaleQuery) {
      return query
        .where(builder => builder
          .where("pi.scopeCoverage", scope)
          .orWhere("pi.ScopeCoverage", STATEWIDE_COVERAGE)
        );
    }

    return query.where("pi.scopeCoverage", scope);
  };


  const queryWithoutCausesWithoutScope = query => query
    .where(builder =>
      builder.where("pi.ScopeCoverage", NATIONWIDE_COVERAGE)
        .orWhere(builder =>
          builder.where("pi.ScopeCoverage", STATEWIDE_COVERAGE)
            .where(builder =>
              builder.whereNotNull("pi.uf")
                .whereNot("pi.uf", "")
            )
        )
        .orWhere(builder =>
          builder.where("pi.ScopeCoverage", CITYWIDE_COVERAGE)
            .where(builder =>
              builder.whereNotNull("pi.cityId")
                .whereNot("pi.cityId", "")
            )
        )
    );

  const queryWithoutCauses = query => isDefaultScope(scope) ? queryWithoutCausesWithoutScope(query).where("pi.scopeCoverage", scope) : queryWithoutCausesWithoutScope(query);

  const buildScopedQuery = query => {
    if (isCausesOnly) {
      return queryCauseOnly(query);
    } else {
      if (hasIncludeCauses) {
        return queryWithCauses(query);
      } else {
        return queryWithoutCauses(query);
      }
    }
  }

  const scopedQuery = query => buildScopedQuery(query);

  const cityQuery = query => {
    if (isMyLocaleQuery && city && uf) {
      return query.where(
        builder => builder.where(
          builder => builder.where("c.Name", city).where("c.Uf", uf)
        ).orWhere(builder => builder.where("pi.Uf", uf).where("pi.ScopeCoverage", STATEWIDE_COVERAGE))
      );
    }

    return city && uf ? query.where("c.Name", city).where("c.Uf", uf) : query;
  };

  const searchQuery = query => search ? query.where(builder => builder.where("pi.Title", "LIKE", `%${search}%`).orWhere("c.Name", "LIKE", `%${search}%`)) : query;

  const pathSubQuery = queryBuilder("petition_info")
    .select("PetitionId")
    .where("PetitionUrl", "LIKE", `%${path}%`);

  const pathQuery = query => path ? query.where("pi.PetitionId", pathSubQuery) : query;

  const finalQuery = pipe(cityQuery, searchQuery, pathQuery, scopedQuery, additionalQuery)(defaultQuery);

  return new Promise((resolve, reject) => {
    const connection = new Connection();
    connection.getConnection(err => {
      if (err) {
        reject(err);
      }
    }, conn => {
      conn.query(String(finalQuery), (error, rows, fields) => {
        conn.release();
        if (error) {
          reject(error);
        } else {
          if (rows.length > plipsLimit) {
            const nextPage = page + 1;
            const petitions = dropLast(1, rows).map(toPetition);

            resolve({ nextPage, page, petitions });
          } else {
            const petitions = rows.map(toPetition);

            resolve({ page, petitions });
          }
        }
      });
    });
  });
}

class Petition {

  constructor() { }

  static update(petition) {
    var query = 'CALL SP_UPDATE_PETITION (?, ?, ?, ?, ?);';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [petition.tx_id, petition.tx_stamp, petition.block_stamp, petition.status, petition.id], function (error, rows, fields) {
          conn.release();
          resolve(petition);
        });
      });
    });
  }

  static insert(petition) {
    petition.status = 0;
    petition.name = petition.name || '';
    var query = 'CALL SP_INSERT_PETITION (@id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); SELECT @id AS id;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        const queryParams = [
          petition.id_version,
          petition.id_petition,
          petition.status,
          petition.name,
          petition.sha,
          petition.url,
          petition.page_url,
          petition.scope_coverage,
          petition.uf,
          petition.city_id,
        ];

        conn.query(query, queryParams, (error, rows, fields) => {
          conn.release();
          if (_.first(rows) && _.first(_.first(rows))) {
            var validations = [];
            var messageError;
            _.each(rows, (row) => {
              if (Array.isArray(row) && _.first(row).Level == "Warning") {
                messageError = _.first(row).Message;
              } else if (Array.isArray(row) && _.first(row).msg != undefined) {
                messageError = _.first(row).msg;
              }
              if (messageError) {
                validations.push(new ValidateAttribute('petition', messageError));
                messageError = undefined;
              }
            });
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorPetitionCreate'].message, validations, listErrors['ErrorPetitionCreate'].errorCode));
          } else {
            resolve(Petition.findById(_.first(rows[1]).id))
          }
        });
      });
    });
  }

  static insertInfo(petition) {
    const queryPetitionExist = `SELECT EXISTS(SELECT 1 FROM petition_info WHERE VersionId=?) as exist`;
    const queryResetLatest = `UPDATE petition_info SET Latest=0 WHERE PetitionId=?`;
    const queryUpdatePetitionInfo = `UPDATE petition_info SET PetitionId=?, PetitionCreatedAt=?, DocumentUrl=?, PetitionUrl=?, Content=?, Presentation=?, TotalSignaturesRequired=?, CallToAction=?, VideoId=?, ShareLink=?, PictureOriginalUrl=?, PictureThumbUrl=?, PictureHeaderUrl=?, Title=?, Subtitle=?, InitialDate=?, FinalDate=?, ScopeCoverage=?, Uf=?, CityId=?, Latest=?, RequiresMobileValidation=?, SyncAt=NOW() WHERE VersionId=?`;
    const queryInsertPetitionInfo = `INSERT INTO petition_info (PetitionId, PetitionCreatedAt, DocumentUrl, PetitionUrl, Content, Presentation, TotalSignaturesRequired, CallToAction, VideoId, ShareLink, PictureOriginalUrl, PictureThumbUrl, PictureHeaderUrl, Title, Subtitle, InitialDate, FinalDate, ScopeCoverage, Uf, CityId, Latest, RequiresMobileValidation, SyncAt, VersionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`;
    const querySelectPetitionInfo = `SELECT * FROM petition_info WHERE VersionId=?`;

    const isLatest = 1;

    const params = [
      petition.detail_id,
      moment.utc(petition.created_at).format('YYYY-MM-DD HH:mm:ss.SSS'),
      petition.document_url,
      petition.plip_url,
      petition.content,
      petition.presentation,
      petition.total_signatures_required,
      petition.call_to_action,
      petition.video_id,
      petition.share_link,
      petition.pictures.original,
      petition.pictures.thumb,
      petition.pictures.header,
      petition.title,
      petition.subtitle,
      moment.utc(petition.initial_date).format('YYYY-MM-DD HH:mm:ss.SSS'),
      moment.utc(petition.final_date).format('YYYY-MM-DD HH:mm:ss.SSS'),
      petition.scope_coverage.scope,
      petition.scope_coverage.city && petition.scope_coverage.city.uf || petition.scope_coverage.uf,
      petition.scope_coverage.city && petition.scope_coverage.city.id,
      isLatest,
      Boolean(petition.requires_mobile_validation),
      petition.id,
    ];

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        err && reject(err)
      }, conn => {
        conn.beginTransaction(err => {
          if (err) {
            return conn.rollback(() => {
              conn.release();
              reject(err);
            });
          }
          conn.query(queryPetitionExist, [petition.id], (err, rows, fields) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                reject(err);
              });
            }

            const petitionExists = _.first(rows).exist;

            if (petitionExists) {
              conn.query(queryUpdatePetitionInfo, params, (err, rows, fields) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    reject(err);
                  })
                }

                conn.query(querySelectPetitionInfo, [petition.id], (err, rows, fields) => {
                  if (err) {
                    return conn.rollback(() => {
                      conn.release();
                      reject(err);
                    })
                  }

                  conn.commit(err => {
                    if (err) {
                      return conn.rollback(() => {
                        conn.release();
                        reject(err);
                      });
                    }
                    conn.release();

                    resolve(rows);
                  });
                });
              });
            } else {
              conn.query(queryResetLatest, [petition.detail_id], (err, rows, fields) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    reject(err);
                  })
                }

                conn.query(queryInsertPetitionInfo, params, (err, rows, fields) => {
                  if (err) {
                    return conn.rollback(() => {
                      conn.release();
                      reject(err);
                    })
                  }

                  conn.query(querySelectPetitionInfo, [petition.id], (err, rows, fields) => {
                    if (err) {
                      return conn.rollback(() => {
                        conn.release();
                        reject(err);
                      })
                    }

                    conn.commit(err => {
                      if (err) {
                        return conn.rollback(() => {
                          conn.release();
                          reject(err);
                        });
                      }
                      conn.release();

                      resolve(rows);
                    });
                  });
                });
              });
            }
          });
        });
      });
    })
  }

  static findLastActive() {
    var query = 'SELECT p.PageUrl AS page_url FROM `petition` as p  WHERE p.Status = 1 ORDER BY p.Create DESC LIMIT 1 ;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          resolve(_.first(rows));
        });
      })
    });
  }

  static findById(id) {
    var query = 'SELECT * FROM petition WHERE Id = ?';
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
    });
  }

  static findByIdVersionPettion(id) {
    var query = 'SELECT Id as petition_id_version, Name AS petition_name, PageUrl AS petition_page_url  FROM petition WHERE IdVersion = ? AND Status = 1';
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
    });
  }

  static findAll() {
    var query = `SELECT p.IdVersion AS id_version , p.Id AS id , p.DigSig as sha FROM  petition p WHERE p.Status = 0 AND p.BlockStamp IS NULL;`;

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
    });
  }

  static findAllBlockchainSignaturesProcessed(id_petition) {
    var query = `SELECT
                  b.File AS petition_pdf_url,
                  b.TxId AS petition_blockchain_transaction_id,
                  b.Create AS petition_updatedat,
                  b.TxStamp AS petition_txstamp,
                  b.BlockStamp AS petition_blockstamp,
                  b.Signature AS petition_signature
                FROM
                  vote AS v
                JOIN
                  petition AS p ON p.Id = v.PetitionId  AND p.Status = 1 AND p.IdPetition = ?
                JOIN
                  batch_vote AS bv ON bv.VoteId = v.Id
                JOIN
                  batch AS b ON b.Id = bv.BatchId
                WHERE
                  v.Status = 1
                  AND b.Status = 1
                GROUP BY
                  b.Id , b.File, b.TxId, b.Create, b.TxStamp, b.BlockStamp, b.Status, b.Signature
                ORDER BY
                  bv.Id`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id_petition], function (error, rows, fields) {
          conn.release();
           _.each(rows, (row) => {
            if(row){
              var splitURL = row.petition_pdf_url ? row.petition_pdf_url.split('/') : '';
              if(splitURL != ''){
                splitURL[splitURL.length-1] = `anonymised/${splitURL[splitURL.length-1]}`;
                splitURL = splitURL.join('/');
              }
              row.petition_pdf_url = `${config.get('AWS_URL')}/${config.get('AWS_BUCKET')}${splitURL}`;
            }
          })
          resolve(rows);
        });
      })
    });
  }

  static plipsPaginated(params = {}) {
    return defaultPlipsPaginated(params);
  }

  static userSignedPlipsPaginated(voteCardId, params = {}) {
    if (!voteCardId) {
      return Promise.resolve({ page: 0, petitions: [] });
    }

    const additionalQuery = query => voteCardId ? query.join("vote as v", "p.Id", "=", "v.PetitionId").where("v.VoteIdCard", voteCardId) : query

    return defaultPlipsPaginated(params, additionalQuery);
  }

  static userFavoritePlipsPaginated(userId, params = {}) {
    if (!userId) {
      return Promise.resolve({ page: 0, petitions: [] });
    }

    const additionalQuery = query => userId ? query.join("favorite as f", "f.PetitionId", "=", "pi.PetitionId").where("f.UserId", userId) : query

    return defaultPlipsPaginated(params, additionalQuery);
  }
}

module.exports = Petition;
