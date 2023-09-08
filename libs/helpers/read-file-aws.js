var _ = require('lodash')
  , config = require('nconf')
  , fs = require('fs')
  , AWS = require('aws-sdk')
  , LogModel = require('../models/log/log')
  , async = require('async')
  , gm = require('gm').subClass({ imageMagick: true })
  , path = require('path')
  , promise = require('bluebird')
  , mkdirp = require('mkdirp');

class ReadFile {

  constructor() {

    this.sns = new AWS.SNS();

    AWS.config.update({
      'region': config.get('AWS_REGION'),
      'accessKeyId': config.get('AWS_ACCESSKEY_ID'),
      'secretAccessKey': config.get('AWS_ACCESSKEY_SECRET')
    });
  }


  async readFolder(bucket, pathFile, dest, extension) {
    function getObject(s3bucket, params) {
      return new Promise((resolve, reject) => {
        s3bucket.getObject(
          params,
          function (error, data) {
            if (!error) {
              var folderSplit = params.Key.split('/');
              var pathFolder = `${dest}/${folderSplit.slice(0, folderSplit.length - 1).join("/")}`;
              if (!fs.existsSync(pathFolder))
                mkdirp.sync(pathFolder);
              fs.writeFile(`${dest}/${params.Key}`, data.Body, function (err) {
                if (!err)
                  resolve(true)
                else
                  resolve(false)
              })
            }
          })
        })
      }

    var that = this;

    return new Promise((resolve, reject) => {
      var s3bucket = new AWS.S3({ params: { Bucket: bucket } });
      var params_bucket = { Bucket: bucket, Prefix: pathFile };
      var listFilesFolder = [];
      s3bucket.listObjectsV2(params_bucket, function (err, data) {
        _.each(data.Contents, content => {
          if (content.Key.indexOf(pathFile) > -1 && content.Key.endsWith(extension)) {
            console.log("Found cover on s3", content.Key);
            var params = { Bucket: bucket, Key: content.Key };
            listFilesFolder.push(getObject(s3bucket, params));
          }
        })

        if (err) throw err;

        return promise.all(listFilesFolder).then(function (results) {
          var result = true
          _.each(results, item => {
            if(!item)
              result = false;
          })
          resolve(result);
        });
      });
    });
  }


}

module.exports = ReadFile;
