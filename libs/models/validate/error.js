module.exports = (function () {

	class Error {
		constructor(type, validations) {
            this.type = type;
            this.validations = validations;
		}
	}
	return Error;
})();
