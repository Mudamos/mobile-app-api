var config = require('nconf')
  , Factory = require('../factory')
  , SendMail = require('../../helpers/send-mail')
  , SendSms = require('../../helpers/send-sms')
  , ValidationModel = require('../../models/response/validation');

class EmailNotification {
  constructor(user, petition, link) {
    if (ValidationModel.validateRequestSync('emailNotification', 'ErrorParameter', user) && ValidationModel.validateRequest('link', 'ErrorParameter', {link:link}))
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: config.get('NOTIFICATION_EMAIL_SUBJECT'),
        template: 'email-confirmation',
        context: { user: user, petition : petition, link: link }
      });
  }
  send() {
    return this.NotificationSend.send();
  }
}

class RemoveAccountNotification {
  constructor(user, petition, link) {
    if (ValidationModel.validateRequestSync('accountRemoveNotification', 'ErrorParameter', user) && ValidationModel.validateRequest('link', 'ErrorParameter', {link:link}))
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: config.get('NOTIFICATION_EMAIL_ACCOUNT_REMOVE_SUBJECT'),
        template: 'remove-account',
        context: { user: user, link: link }
      });
  }
  send() {
    return this.NotificationSend.send();
  }
}

class VoteNotification {
  constructor(user, petition) {
    if (ValidationModel.validateRequestSync('voteNotification', 'ErrorParameter', { user_name : user.user_name , petition_name : petition.petition_name, petition_page_url : petition.petition_page_url } ))
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: config.get('NOTIFICATION_VOTE_SUBJECT'),
        template: 'vote-confirmation',
        context: { user: user, petition: petition }
      });
  }
  send() {
    return this.NotificationSend.send();
  }
}

class SMSNotification {
  constructor(mobile) {
    if (ValidationModel.validateRequestSync('mobileNotification', 'ErrorParameter', mobile))
      this.NotificationSend = new SendSms(mobile);
  }
  send() {
    return this.NotificationSend.send();
  }
}

class ResetPasswordNotification {
  constructor(user, pinCode) {
    if (ValidationModel.validateRequestSync('emailNotification', 'ErrorParameter', user) && ValidationModel.validateRequestSync('pinCode', 'ErrorParameter', {pinCode: pinCode}))
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: config.get('NOTIFICATION_EMAIL_SUBJECT_RESET_PASSWORD'),
        template: 'reset-password',
        context: { user: user, pinCode: pinCode }
      });
  }
  send() {
    return this.NotificationSend.send();
  }
}

class ResetPasswordNotificationApple {
  constructor(user) {
    if (ValidationModel.validateRequestSync('emailNotification', 'ErrorParameter', user)) {
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: config.get('NOTIFICATION_EMAIL_SUBJECT_RESET_PASSWORD'),
        template: 'reset-password-apple',
        context: { user },
      });
    }
  }

  send() {
    if (this.NotificationSend) {
      return this.NotificationSend.send();
    }

    // Keeping api compatibility
    return Promise.resolve({});
  }
}

class ResetPasswordNotificationFacebook {
  constructor(user, pinCode) {
    if (ValidationModel.validateRequestSync('emailNotification', 'ErrorParameter', user) && ValidationModel.validateRequestSync('pinCode', 'ErrorParameter', {pinCode: pinCode}))
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: config.get('NOTIFICATION_EMAIL_SUBJECT_RESET_PASSWORD'),
        template: 'reset-password-fb',
        context: { user: user, pinCode: pinCode }
      });
  }

  send() {
    if (this.NotificationSend) {
      return this.NotificationSend.send();
    }

    // Keeping api compatibility
    return Promise.resolve({});
  }
}

class EmailMobilePinCodeNotification {
  constructor(user, pinCode) {
    if (ValidationModel.validateRequestSync('emailNotification', 'ErrorParameter', user) && ValidationModel.validateRequestSync('pinCode', 'ErrorParameter', {pinCode: pinCode}))
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: config.get('NOTIFICATION_EMAIL_SUBJECT_MOBILE_PIN'),
        template: 'mobile-pin',
        context: { user: user, pinCode: pinCode }
      });
  }
  send() {
    return this.NotificationSend.send();
  }
}


class SignNotFinished {
  constructor(user) {
    if (ValidationModel.validateRequestSync('emailNotification', 'ErrorParameter', user) )
      this.NotificationSend = new SendMail({
        from: config.get('NOTIFICATION_EMAIL_FROM'),
        to: user.profile_email,
        subject: 'Você está quase lá!',
        template: 'cadastros-nao-finalizados',
        context: { user: user}
      });
  }
  send() {
    return this.NotificationSend.send();
  }
}

var FactoryNotification = new Factory();

FactoryNotification.register('EmailNotification', EmailNotification);
FactoryNotification.register('RemoveAccountNotification', RemoveAccountNotification)
FactoryNotification.register('VoteNotification', VoteNotification);
FactoryNotification.register('SMSNotification', SMSNotification);
FactoryNotification.register('ResetPasswordNotification', ResetPasswordNotification);
FactoryNotification.register('ResetPasswordNotificationApple', ResetPasswordNotificationApple);
FactoryNotification.register('ResetPasswordNotificationFacebook', ResetPasswordNotificationFacebook);
FactoryNotification.register('EmailMobilePinCodeNotification', EmailMobilePinCodeNotification);
FactoryNotification.register('SignNotFinished', SignNotFinished);

module.exports = FactoryNotification;
