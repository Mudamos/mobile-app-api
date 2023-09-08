var _ = require('lodash') 
  , FB = require('fb')
  , config = require('nconf');
  
class Facebook {

  constructor() {
    FB.options({version: 'v3.2'});
    FB.setAccessToken(`${config.get('FACEBOOK_CLIENT_ID')}|${config.get('FACEBOOK_CLIENT_SECRET')}`);
  }

  static generateImgLink(picture, type, profileId, size) {
    var imgUrl;
    if (type == 'facebook') {
      imgUrl = picture ? picture : `https://graph.facebook.com/v3.2/${profileId}/picture?type=${size}`;
    } else if (!picture) {
      imgUrl = `${config.get('AWS_URL')}/${config.get('AWS_URL_IMG_BUCKET')}/images/profile/pictures/picture_defaul_normal.jpg`;
    } else {
      imgUrl = picture;
    }
    return imgUrl;
  }

  getFriends(profileId) {
    var results = [];
    return new Promise((resolve, reject) => {
      FB.api(
        `/${profileId}/friends`,
        function (response) {
          if (response && !response.error) {
            _.each(response.data, (friend) => {
              results.push({id : friend.id, pictureUrl : Facebook.generateImgLink(null, 'facebook', friend.id, 'small') })
            })
            resolve(results);           
          }else{
            resolve([]);
          }
        }
      )
    });
  }
}

module.exports = Facebook; 
