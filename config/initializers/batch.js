var express = require('express')
  , config = require('nconf')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('cookie-session')
  , logger = require('winston')
  , passport = require('passport')
  , path = require('path')
  , expressHbs = require('express-handlebars')
  , cluster = require('cluster')
  , http = require('http')
  , TraceModel = require('../../libs/models/log/trace')
  , async = require('async')
  , Connection = require('./database')
  , compression = require('compression');

var app;

var start = function () {

    app = express();
    app.use(compression());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(session({
      secret: 'mudamosmobileapi',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }
    }))

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function (err, req, res, next) {
      if (err)
        var response = { 'status': 'error', 'message': err.message, 'errorCode': 500 };

      res.status(err.status || 500).send(response);
      next(err);
    });

    function logResponseBody(req, res, next) {
      var oldWrite = res.write, oldEnd = res.end;
      var chunks = [];
      res.write = function (chunk) {
        if (chunk && chunk.buffer instanceof ArrayBuffer) {
          chunks.push(chunk);
        }
        oldWrite.apply(res, arguments);
      };
      res.end = function (chunk) {
        if (chunk && chunk.buffer instanceof ArrayBuffer) {
          chunks.push(chunk);
          var body = Buffer.concat(chunks).toString('utf8');
          async.queue(TraceModel.log(req.originalUrl.toUpperCase(), `{"Headers":${JSON.stringify(req.headers)},"Request":${JSON.stringify(req.body)} }`, body, body != 'Unauthorized' && body.toLowerCase().indexOf('<html>') < 0 && JSON.parse(body).status != 'success' ? 1 : 0), 1);
        }
        oldEnd.apply(res, arguments);
      };
      next();
    }

    if (/^true$/i.test(config.get("TRACE_REQUEST") || "")) {
      app.use(logResponseBody);
    }

    app.set('views', path.resolve(__dirname, '../../views'));
    app.engine('hbs', expressHbs({ extname: 'hbs' }));
    app.set('view engine', 'hbs');

    require('../../app_v1/initializers/batch')(app, passport);

    process.stdin.resume();

    function exitHandler(options, err) {
      var connection = new Connection();
      var pool = connection.getPool();
      pool.end();
      if (options.cleanup) console.log('clean');
      if (err) console.log(err.stack);
      if (options.exit) process.exit();
    }

    process.on('exit', exitHandler.bind(null, { cleanup: true }));
    process.on('SIGINT', exitHandler.bind(null, { exit: true }));
    process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

    app.listen(process.env.PORT || 4000);
    logger.info(`[WORKER-${process.pid}] Listening on port ${process.env.PORT}`);
};

module.exports = start;
