var _ = require('lodash')
	, listErrors = require('../../libs/helpers/errors-list')
	, SuccessModel = require('../../libs/models/response/success')
	, ConfigModel = require('../../libs/models/config/config')
	, ValidationModel = require('../../libs/models/response/validation')
	, ValidateAttribute = require('../../libs/models/validate/attribute');

class ConfigService {

	constructor() { }

	static getConfigKey(key) {
		return ConfigModel.getConfig(key)
			.then(config => {
				if (!config){
					throw new ValidationModel('fail', 'validation', listErrors['ErrorConfigNotExists'].message, [new ValidateAttribute('key', listErrors['ErrorConfigNotExists'])], listErrors['ErrorConfigNotExists'].errorCode)
				}else{
					return new SuccessModel('success', { config: { key: key, value: config.Value } });
				}
			})
	}
}

module.exports = ConfigService;
