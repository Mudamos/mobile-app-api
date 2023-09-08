var config = require('nconf')
  , fs = require('fs')
  , AWS = require('aws-sdk')
  , LogModel = require('../models/log/log')
  , async = require('async')
  , gm = require('gm').subClass({ imageMagick: true });

class SendFile {

  constructor(file_path, file_name) {

    this.file_path = file_path;
    this.file_name = file_name;
    this.sns = new AWS.SNS();

    AWS.config.update({
      region: config.get('AWS_REGION'),
      accessKeyId: config.get('AWS_ACCESSKEY_ID'),
      secretAccessKey: config.get('AWS_ACCESSKEY_SECRET'),
    });
  }

  async send(bucket, acl) {
    var that = this;

    return new Promise((resolve, reject) => {
      fs.readFile(that.file_path, function (err, data) {
        if (err) {
          throw err;
        }

        var s3bucket = new AWS.S3({ params: { Bucket: bucket }, httpOptions : {timeout: 12000000, connectTimeout : 12000000}, maxRetries : 10 });

        var path = that.file_name ? that.file_name : that.file_path;
        var pathSplit = path.replace(/[\\"]/g, '//').split('/');
        var startIndex = pathSplit.indexOf('pdf_process') + 1;
        var keyName = [];
        for (var i = startIndex; i <= pathSplit.length - 1; i++) {
          keyName.push(`${pathSplit[i]}/`)
        }

        var params = {
          Key: keyName.join('').substr(0, keyName.join('').length - 1),
          Body: data,
          ACL: acl ? acl : "private",
        };
        var options = {partSize: 20 * 1024 * 1024, queueSize: 1};

        s3bucket.upload(params, options,  function(err, data) {
          if (err) {
            reject(err)
            async.queue(LogModel.log('AWS-SEND-FILE', JSON.stringify(that.file_path), JSON.stringify(err), true), 1);
          } else {
            async.queue(LogModel.log('AWS-SEND-FILE', JSON.stringify(that.file_path), JSON.stringify(keyName), false), 1);
            resolve(that.file_name ? that.file_name : that.file_path);
          }
        });
      });
    });
  }

  sendImageAvatarAsync(bucket) {
    var that = this;
    const avatarSize = parseInt(config.get("AVATAR_IMAGE_RESIZE"), 10);

    return new Promise((resolve, reject) => {
      fs.readFile(that.file_path, function (err, data) {
        if (err) {
          throw err;
        }

        var s3bucket = new AWS.S3({ params: { Bucket: bucket } });

        var path = that.file_name ? that.file_name : that.file_path;
        var pathSplit = path.replace(/[\\"]/g, '//').split('/');
        var startIndex = pathSplit.indexOf('pdf_process') + 1;
        var keyName = [];
        for (var i = startIndex; i <= pathSplit.length - 1; i++) {
          keyName.push(`${pathSplit[i]}/`)
        }

        gm(that.file_path)
          .resize(avatarSize, avatarSize)
          .stream(function (err, stdout, stderr) {
            var params = {
              ACL: "public-read",
              Key: keyName.join('').substr(0, keyName.join('').length - 1),
              Body: stdout
            };

            s3bucket.upload(params, function(err, data) {
              if (err) {
                resolve(null);
              } else {
                if (that.file_path && that.file_name) {
                  fs.unlink(that.file_path, (err) => {
                    if (err) {
                      console.log("failed to delete local image:" + err);
                    } else {
                      console.log('successfully deleted local image');
                    }
                  });

                  resolve(that.file_name ? that.file_name : that.file_path);
                } else {
                  resolve(null);
                }
              }
            });
          });
      });
    })
  }
}

module.exports = SendFile;
