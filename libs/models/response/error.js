class Error {

	constructor(status, message, errorCode) {
		this.status = status;
		this.message = message;
		this.errorCode = errorCode;
	}

}
module.exports = Error;
