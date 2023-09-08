var randtoken = require('rand-token');

class TokenService {
    constructor(){}
		static generateAccessToken() {
      return  { 
        access_token: randtoken.generate(256) 
       ,token_type: 'Bearer'}
		};
    static generatNotificationToken(type) {
      return  { 
        access_token: randtoken.generate(256) 
       ,token_type: type}
		};
}

module.exports = TokenService;
