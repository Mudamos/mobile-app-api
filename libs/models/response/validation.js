var _ = require('lodash')
	, validateList = require('../../helpers/validations-list')
	, listErrors = require('../../helpers/errors-list')
	, ValidateAttribute = require('../validate/attribute')
	, Promise = require('promise');




class Validation {

	constructor(status, type, message, validations, errorCode) {
		this.status = status;
		this.data = {
			errorCode: errorCode,
			type: type,
			message: message,
			validations: validations
		}
	}

	static validateRequestSync(validation, error, object) {
		if (!validation || !error || !object) {
			throw new Validation('fail', 'validation', listErrors['ErrorParameter'].message, null, listErrors['ErrorParameter'].errorCode);
		} else {
			var validations = [];
			_.forOwn(validateList.Validations[validation], (value, key) => {
				if (object == undefined || !object[key] || object[key] == null || !value.validate(object[key]))
					validations.push(new ValidateAttribute(key, value.message))
			});

			if (validations.length) {
				throw new Validation('fail', 'validation', listErrors[error].message, validations, listErrors[error].errorCode);
			} else {
				return true;
			}
		}
	}

	static validateRequest(validation, error, object) {
		return new Promise((resolve, reject) => {
			if (!validation || !error || !object) {
				reject(new Validation('fail', 'validation', listErrors['ErrorParameter'].message, null, listErrors['ErrorParameter'].errorCode));
			} else {
				var validations = [];
				_.forOwn(validateList.Validations[validation], (value, key) => {
					if (object == undefined || object[key] == null || !value.validate(object[key]))
						validations.push(new ValidateAttribute(key, value.message))
				});
				if (validations.length) {
					reject(new Validation('fail', 'validation', listErrors[error].message, validations, listErrors[error].errorCode));
				} else {
					resolve(true);
				}
			}
		})
	}
}

module.exports = Validation;
