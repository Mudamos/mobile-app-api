class Fail {

	constructor(status, type, message, errorCode) {
		this.status = status;
		this.data = {
			errorCode: errorCode,
			type: type,
			message: message
		}
	}
}

module.exports = Fail;
