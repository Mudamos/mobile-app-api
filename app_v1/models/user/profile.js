var _ = require('lodash')
	, moment = require('moment')
	, Connection = require('../../../config/initializers/database')
	, ValidationModel = require('../../../libs/models/response/validation')
	, ValidateAttribute = require('../../../libs/models/validate/attribute')
	, listErrors = require('../../../libs/helpers/errors-list')
	, validator = require('validator')
  , queryBuilder = require("../../../src/db/query-builder")
  , appConfig = require('../../../config')();

class Profile {

	constructor() { }

	static updateUserProfile(user, user_cache) {

		var query = 'UPDATE user SET ';
		const params = [];

		if (!validator.isEmpty(user.birthday)) {
			query += 'Birthday = ?,';
			params.push(user.birthday);
		}

		if (!validator.isEmpty(user.name)) {
			query += 'Name = ?,';
			params.push(user.name);
		}

		if (!validator.isEmpty(user.zipcode)) {
			query += 'Zipcode = ?,';
			params.push(user.zipcode);
		}

		query += 'State = ?,';
		params.push(user.state || null);

		query += 'City = ?,';
		params.push(user.city || null);

		query += 'District = ?,';
		params.push(user.district || null);

		query += 'UF = ?,';
		params.push(user.uf || null);

		query += 'Lat = ?,';
		params.push(user.lat || null);

		query += 'Lng = ?,';
		params.push(user.lng || null);

		query = query.substr(0, query.length - 1);
		query += ' WHERE Id = ?';
		params.push(user_cache.user_id);

		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, params, function (error, rows, fields) {
					conn.release();
					if (rows && rows.affectedRows) {
						user_cache.user_birthday = user.birthday || user_cache.user_birthday;
						user_cache.user_name = user.name || user_cache.user_name;
						user_cache.user_zipcode = user.zipcode || user_cache.user_zipcode;
						user_cache.user_state = user.state;
						user_cache.user_uf = user.uf;
						user_cache.user_district = user.district;
						user_cache.user_city = user.city;
						user_cache.user_lat = user.lat;
						user_cache.user_lng = user.lng;
						resolve(user_cache);
					}
					resolve(user_cache);
				});
			});
		});
	};

	static updateUserEmail(user, user_cache) {
		user_cache.update = false;
		var query = 'CALL SP_UPDATE_USER_EMAIL(@rows, ?, ?, ?);SELECT @rows as affected_rows';
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, [user.profile_email, user_cache.user_id, user_cache.profile_id], function (error, rows, fields) {
					conn.release();
					if (rows && rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))
						reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCreate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserCreate'].errorCode));
					else {
						if (rows && _.first(rows[1]).affected_rows > 0) {
							user_cache.profile_email = user.profile_email;
							user_cache.update = true;
						}
						resolve(user_cache);
					}
				});
			});
		});
	};

	static updateUserEmailRootAuthorization(user, user_cache) {
		user_cache.update = false;
		var query = 'CALL SP_UPDATE_USER_EMAIL(@rows, ?, ?, ?);SELECT @rows as affected_rows';
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, [user.new_profile_email, user_cache.user_id, user_cache.profile_id], function (error, rows, fields) {
					conn.release();
					if (rows && rows[0] && rows[0][0] && !validator.isEmpty(_.first(_.first(rows)).msg))
						reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserCreate'].message, [new ValidateAttribute('email', listErrors['ErrorUserEmailDuplicate'].message)], listErrors['ErrorUserCreate'].errorCode));
					else {
						if (rows && _.first(rows[1]).affected_rows > 0) {
							user_cache.profile_email = user.new_profile_email;
							user_cache.update = true;
						}
						resolve(user_cache);
					}
				});
			});
		});
	};

  static updateUserVoteCity(user, city) {
    const query = 'UPDATE user SET voteCityId = ? WHERE id = ?';

    return new Promise((resolve, reject) => {
      const connection = new Connection();

      connection.getConnection(err => {
        if (err) {
          reject(err);
        }
      }, conn => {
        conn.query(query, [city.id, user.user_id], (error, rows, fields) => {
          conn.release();

          if (rows.affectedRows) {
            user.voteCityId = city.id;
            user.voteCityName = city.name;
            user.voteCityUf = city.uf;
          }

          resolve(user);
        });
      });
    });
  };

	static updateUserBirthday(user, user_cache) {
		var query = 'UPDATE user SET Birthday = ?  WHERE Id = ?';
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, [moment(user.birthday, ["YYYY-MM-DD"]).format('YYYY-MM-DD'), user_cache.user_id], function (error, rows, fields) {
					conn.release();
					if (rows.affectedRows) {
						user_cache.user_birthday = moment(user.birthday, ["YYYY-MM-DD"]).format('YYYY-MM-DD');
					}
					resolve(user_cache);
				});
			});
		});
	};

	static updateUserZipCode(user, user_cache) {
		var query = 'UPDATE user SET ';
		const params = [];

		if (!validator.isEmpty(user.zipcode)) {
			query += 'Zipcode = ?,';
			params.push(user.zipcode);
		}

		if (user.state && !validator.isEmpty(user.state)) {
			query += 'State = ?,';
			params.push(user.state);
		}

		if (user.city && !validator.isEmpty(user.city)) {
			query += 'City = ?,';
			params.push(user.city);
		}

		if (user.district && !validator.isEmpty(user.district)) {
			query += 'District = ?,';
			params.push(user.district);
		}

		if (user.uf && !validator.isEmpty(user.uf)) {
			query += 'UF = ?,';
			params.push(user.uf);
		}

		if (user.lat && !validator.isEmpty(user.lat.toString())) {
			query += 'Lat = ?,';
			params.push(user.lat);
		}

		if (user.lng && !validator.isEmpty(user.lng.toString())) {
			query += 'Lng = ?,';
			params.push(user.lng);
		}

		query = query.substr(0, query.length - 1);
		query = query + ' WHERE Id = ?';
		params.push(user_cache.user_id);

		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, params, function (error, rows, fields) {
					conn.release();
					if (rows && rows.affectedRows) {
						user_cache.user_zipcode = user.zipcode || user_cache.user_zipcode;
						user_cache.user_state = user.state || user_cache.user_state;
						user_cache.user_uf = user.uf || user_cache.user_uf;
						user_cache.user_district = user.district || user_cache.user_district;
						user_cache.user_city = user.city || user_cache.user_city;
						user_cache.user_lat = user.lat || user_cache.user_lat;
						user_cache.user_lng = user.lng || user_cache.user_lng;
						resolve(user_cache);
					}
				});
			});
		});
	};

	static updateUserDocuments(user, user_cache) {
		var query = 'UPDATE user SET CPF = ?, VoteIdCard = ? , TermsAccepted = ? WHERE Id = ?';
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, [user.cpf, user.voteidcard, user.termsAccepted ? 1 : 0, user_cache.user_id], function (error, rows, fields) {
					conn.release();
					if (rows && rows.affectedRows) {
						user_cache.user_cpf = user.cpf;
						user_cache.user_voteidcard = user.voteidcard;
					}
					if (error) {
						var validations = [];

						if (error.message.indexOf('CPF') > 0)
							validations.push(new ValidateAttribute('cpf', listErrors['ErrorUserDocumentsCPF'].message))

						if (error.message.indexOf('VOTEIDCARD') > 0)
							validations.push(new ValidateAttribute('voteidcard', listErrors['ErrorUserDocumentsVoteIdCard'].message))

						reject(new ValidationModel('fail', 'validation', listErrors['ErrorUserDocuments'].message, validations, listErrors['ErrorUserDocuments'].errorCode));
					}
					resolve(user_cache);
				});
			});
		});
	};

	static updateUserPhoto(picture_url, user_cache) {
		const now = moment().format("YYYY-MM-DD HH:mm:ss");
		const hasAvatar = 1;

		const query = queryBuilder("profile").where("ProfileId", "=", user_cache.profile_id).update({
			Picture: picture_url,
			IsAvatar: hasAvatar,
			PictureUpdatedAt: now,
		});

		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query.toString(), function (error, rows, fields) {
					conn.release();
					if (rows && rows.affectedRows) {
						user_cache.profile_picture = picture_url;
						user_cache.has_saved_avatar = true;
					}
					resolve(user_cache);
				});
			});
		});
	};
}

module.exports = Profile;
