var moment = require('moment')
	, Connection = require('../../../config/initializers/database')
	, ValidationModel = require('../../../libs/models/response/validation')
	, ValidateAttribute = require('../../../libs/models/validate/attribute')
	, listErrors = require('../../../libs/helpers/errors-list');

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
						user_cache.user_state = user.state || user_cache.user_state;
						user_cache.user_uf = user.uf || user_cache.user_uf;
						user_cache.user_district = user.district || user_cache.user_district;
						user_cache.user_city = user.city || user_cache.user_city;
						user_cache.user_lat = user.lat || user_cache.user_lat;
						user_cache.user_lng = user.lng || user_cache.user_lng;
						resolve(user_cache);
					}
					resolve(user_cache);
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
						}
						resolve(user_cache);
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
					if (rows.affectedRows) {
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
		var query = 'UPDATE profile SET Picture = ? , IsAvatar = ? WHERE ProfileId = ?';
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
				conn.query(query, [picture_url, 1, user_cache.profile_id], function (error, rows, fields) {
					conn.release();
					if (rows.affectedRows) {
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
