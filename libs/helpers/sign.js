var MudamosLibCrypto = require('mudamos-libcrypto')
	, ConfigModel = require('../models/config/config')
	, crypto = require('crypto')
	, sha256 = require('sha256');

class Sign {

    constructor() { }

    static toHex(str) {
        var hex = '';
        for (var i = 0; i < str.length; i++) {
            hex += '' + str.charCodeAt(i).toString(16);
        }
        return hex;
    };

    static verifyMineMessage(message, block){
			return ConfigModel.getConfig('difficulty')
			.then(config => {
				let result = false;
				let difficulty = parseInt(config.Value / 2);
  				let msha256 =  sha256(message);
			    let _message = block.split(';')[0];
				result = MudamosLibCrypto.checkMinedMessage(_message,difficulty,block);
				return result;
			})
    }

}

module.exports = Sign;
