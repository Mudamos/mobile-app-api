"use strict";

const AWS = require("aws-sdk");

const {
  always,
} = require("ramda");

const copySource = ({ bucket, key }) => `/${bucket}/${key}`.replace(/\/\//g, "/");

const fileExists = ({ s3, bucket, key }) =>
  s3.headObject({ Bucket: bucket, Key: key }).promise()
    .then(always(true))
    .catch(e => e.statusCode === 404 ? false : Promise.reject(e));

module.exports.s3FileMover = ({ config, logger = console }) => async ({ acl, from, to }) => {
  const s3 = new AWS.S3({
    region: config("AWS_REGION"),
    accessKeyId: config("AWS_ACCESSKEY_ID"),
    secretAccessKey: config("AWS_ACCESSKEY_SECRET"),
  });

  const exists = await fileExists({ s3, bucket: from.bucket, key: from.key });
  if (!exists) {
    logger.info("File does not exist:", from);
    return;
  }

  await s3.copyObject({
    Bucket: to.bucket,
    Key: to.key,
    ACL: acl,
    CopySource: copySource(from),
  }).promise();

  return s3.deleteObject({ Bucket: from.bucket, Key: from.key })
    .promise()
    .catch(e => logger.info("Error deleting object from s3. Skipping...", e));
};
