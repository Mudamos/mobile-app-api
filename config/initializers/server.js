var express = require('express')
  , config = require('nconf')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('cookie-session')
  , passport = require('passport')
  , path = require('path')
  , expressHbs = require('express-handlebars')
  , cluster = require('cluster')
  , http = require('http')
  , TraceModel = require('../../libs/models/log/trace')
  , async = require('async')
  , Connection = require('./database')
  , compression = require('compression')
  , CacheRedis = require('./cache-redis');

const {
  times,
} = require("ramda");

const { safelyParseJSON } = require("../../src/utils");
const Sign = require("../../libs/helpers/sign");
const SendResponse = require("../../libs/helpers/send-response");

const {
  requestId,
  requestLogger,
  withUser,
  requiresMudamosWebAuth,
} = require("../../src/api/middlewares");

const {
  appConfigRepository,
  petitionRepository,
  petitionInfoRepository,
  petitionMobileRepository,
  profileRepository,
  userRepository,
  userProfileRepository,
} = require("../../src/repositories");

const {
  signedMessageRepository,
} = require("../../src/repositories/signer");

const {
  AppleSignIn,
  FBLimitedAuth,
  IntegratorAppLinkGeneratorDevTest,
  PlipMobileValidationSender,
  PlipMobileValidationVerifier,
  RequiresMobileValidation,
  CustomMessageSignRegister,
  ValidateCustomMessageSign,
} = require("../../src/use-cases");

const {
  UserProfile,
} = require("../../src/models");

const TokenService = require("../../app_v3/services/token");

const { Queue } = require("../../src/services");

var cacheTime = 86400000 * 7;
var app;

var start = function ({
  config: appConfig,
  logger,
  logStream,
}) {
    app = express();
    app.use(requestId());
    app.use(requestLogger({ "stream": logStream }));
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
          const parsedBody = safelyParseJSON(body);

          async.queue(
            TraceModel.log(
              req.originalUrl.toUpperCase(),
              `{"Headers":${JSON.stringify(req.headers)},"Request":${JSON.stringify(TraceModel.cleanPassword(req.originalUrl.toUpperCase(), req.body))} }`,
              body,
              body != 'Unauthorized' && body.toLowerCase().indexOf('<html>') < 0 && (!parsedBody || parsedBody.status != 'success') ? 1 : 0
            ),
            1
          );
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

    const webConcurrency = parseInt(appConfig("WEB_CONCURRENCY") || 1, 10);

    if (cluster.isMaster) {
      logger.info("Master %d is running", process.pid);
      logger.info(`Will soon spawn ${webConcurrency} slaves`);
      // Fork workers.
      times(() => cluster.fork(), webConcurrency);

      cluster.on('exit', (worker, code, signal) => {
        console.log("Worker died: pid %d", worker.process.pid);
        cluster.fork();
      });
    } else {
      const db = require("../../src/db")(appConfig);
      const signerDb = require("../../src/db")(appConfig, { database: "signer" });
      const Cache = new CacheRedis();
      const PinCode = require("../../libs/helpers/pin-code");
      const SMSSender = require("../../libs/helpers/send-sms");
      const AppleAuth = require("apple-signin-auth");
      const userRepo = userRepository(db);
      const profileRepo = profileRepository(db);
      const userProfileRepo = userProfileRepository(db);
      const UserNotificationSender = require("../../app_v2/services/user");
      const queue = Queue(appConfig);

      const AuthService = require("../../app_v2/services/auth");

      const dependencies = [
        app,
        passport,
        {
          appleSignIn: AppleSignIn({
            AppleAuth,
            Cache,
            SendResponse,
            Sign,
            TokenService,
            UserNotificationSender,
            config: appConfig,
            logger,
            profileRepository: profileRepo,
            userRepository: userRepo,
            userProfileRepository: userProfileRepo,
          }),
          config: appConfig,
          customMessageSignRegister: CustomMessageSignRegister({
            enqueueMessage: queue.enqueueMessageSignIntegratorCallback,
            signedMessageRepository: signedMessageRepository(signerDb),
            logger,
          }),
          fbLimitedAuth: FBLimitedAuth({
            AuthService,
            SignVerifier: Sign,
            TokenService,
          }),
          integratorAppLinkGeneratorDevTest: IntegratorAppLinkGeneratorDevTest({ config: appConfig }),
          logger,
          validateCustomMessageSign: ValidateCustomMessageSign({
            appConfigRepository: appConfigRepository(db),
            logger,
          }),
          withUser: withUser({ passport, UserProfile, userRepository: userRepo }),
          requiresMudamosWebAuth: requiresMudamosWebAuth({ config: appConfig }),
          plipMobileValidationSender: PlipMobileValidationSender({
            petitionRepository: petitionRepository(db),
            petitionMobileRepository: petitionMobileRepository(db),
            config: appConfig,
            Cache,
            PinCode,
            SMSSender,
          }),
          plipMobileValidationVerifier: PlipMobileValidationVerifier({
            petitionRepository: petitionRepository(db),
            petitionMobileRepository: petitionMobileRepository(db),
            PinCode,
          }),
          requiresMobileValidation: RequiresMobileValidation({
            petitionRepository: petitionRepository(db),
            petitionInfoRepository: petitionInfoRepository(db),
            petitionMobileRepository: petitionMobileRepository(db),
          }),
        },
      ];

      require('../../app_v1/initializers/server')(...dependencies);
      require('../../app_v2/initializers/server')(...dependencies);
      require('../../app_v3/initializers/server')(...dependencies);


      // Fetch apple public keys and cache. Avoid weird crash
      // UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): TypeError: source.hasOwnProperty is not a function
      AppleAuth._getApplePublicKeys().then(() => {
        // Workers can share any TCP connection
        // In this case it is an HTTP server
        const port = process.env.PORT || 4000;
        app.listen(port);
        logger.info(`Worker ${process.pid} started on port ${port}`);
      });
    }

};

module.exports = start;
