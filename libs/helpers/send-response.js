"use strict";

const { is } = require("ramda");

const isError = is(Error);

class Response {

	constructor() {}

	static send(res, result) {
		var className = result ? result.constructor.name.toLowerCase() : null;

		if (className == 'error' || isError(result)) {
			res.status(500).send(result);

      if (process.env.NODE_ENV === "development") {
        console.log("Error", result);
      }
		} else {
			res.status(200).send(result);
    }
	}
}

module.exports = Response;
