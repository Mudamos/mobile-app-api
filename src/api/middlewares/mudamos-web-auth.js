"use strict";

module.exports = ({ config }) => () => (req, res, next) => {
  if (!req.headers.authorization || req.headers.authorization !== config("AUTHORIZATION_KEY")) {
    res.sendStatus(401);
    return next(new Error("Unauthorized"));
  } else {
    next();
  }
}