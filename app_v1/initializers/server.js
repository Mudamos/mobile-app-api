module.exports = (app, passport, ...dependencies) => {
  require('./auth/strategy');
  require('../routes/index')(app, passport, ...dependencies);
};
