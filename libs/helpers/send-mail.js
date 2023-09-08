var nodemailer = require('nodemailer')
  , hbs = require('nodemailer-express-handlebars')
  , handlebars = require('express-handlebars')
  , path = require('path')
  , config = require('nconf');

class SendMail {

  constructor(mailOptions) {
    var smtpConfig = {
      host: config.get('NOTIFICATION_EMAIL_SMTP_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: config.get('NOTIFICATION_EMAIL_SMTP_USER'),
        pass: config.get('NOTIFICATION_EMAIL_SMTP_PASS')
      }
    };
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.transporter.use('compile', hbs({
      extName: '.hbs',
      viewEngine: handlebars.create(),
      viewPath: path.resolve(__dirname, '../../templates/notification')
    }));
    this.mailOptions = mailOptions;
  }

  send() {
    return this.transporter.sendMail(this.mailOptions);
  }
}

module.exports = SendMail;
