var changeCase = require('change-case')
  , express = require('express')
  , routes = require('require-dir')();

module.exports = (app, passport, ...dependencies) => {
  Object.keys(routes).forEach(function (routeName) {
    var router = express.Router();
    require('./' + routeName)(router, passport, app, ...dependencies);
    app.use('/api/v2/' + changeCase.paramCase(routeName), router);
  });
};
