"use strict";

const AWS = require("aws-sdk");
const Bluebird = require("bluebird");

const {
  all,
  allPass,
  always,
  either,
  equals,
  map,
  pipe,
  prop,
  splitEvery,
} = require("ramda");

const {
  forceGCAndLog,
  generateHash,
} = require("../../utils");

const { loadPDF } = require("../../../app_v1/services/schedule-pdf");
const { register: registerBlockchain } = require("../../../app_v1/models/blockchain/blockchain");

const pdfExists = ({ s3, bucket }) => ({ key }) =>
  s3.headObject({ Bucket: bucket, Key: key }).promise()
    .then(always(true))
    .catch(e => e.statusCode === 404 ? false : Promise.reject(e));

const successfullyRegistered = response => allPass([
  Boolean,
  either(
    prop("success"),
    pipe(prop("reason"), equals("existing"))
  ),
])(response ? JSON.parse(response) : null);

const processJob = ({
  batchRepository,
  batchVoteRepository,
  config,
  logger,
  petitionRepository,
  s3,
  transaction,
  voteRepository,
}) => async ({
  anonymisedPdfKey,
  batchKey,
  normalPdfKey,
  cityId,
  uf,
  petitionId,
}) => {
  const privateBucket = config("AWS_BUCKET_PRIVATE");
  const petition = await petitionRepository.findLatestByPetitionId(petitionId);

  const getSignatureInfoFromPdf = async () => {
    const pdf = await s3.getObject({
      Bucket: privateBucket,
      Key: normalPdfKey,
    }).promise().then(prop("Body"));

    const signatureLines = await loadPDF(pdf);
    const getSignature = line => line.split(";")[7];
    const splitter = splitEvery(1000);

    return {
      hash: generateHash(pdf),
      signatures: pipe(map(getSignature), splitter)(signatureLines),
    };
  };

  const getAnonymisedPdfHash = () =>
    s3.getObject({
      Bucket: privateBucket,
      Key: anonymisedPdfKey,
    })
    .promise()
    .then(prop("Body"))
    .then(generateHash);

  const { signatures, hash } = await getSignatureInfoFromPdf();
  // Forcing gc because this a memory heavy vote computation
  // this process should be running alone in a worker so it would not
  // impact others
  forceGCAndLog();

  const blockchainResponse = await registerBlockchain(hash);
  if (!successfullyRegistered(blockchainResponse)) {
    throw new Error("Could not successfully register the signature pdf on the blockchain");
  }

  logger.info("Sucessfully registered on the blockchain");

  const anonymisedHash = await getAnonymisedPdfHash();
  forceGCAndLog();

  const batch = await batchRepository.create({
    anonymisedSignature: anonymisedHash,
    key: batchKey,
    signature: hash,
    transaction,
    cityId,
    uf,
    petitionId: petition.id,
  });
  const batchId = batch.id;

  await Bluebird.map(signatures, signaturesBatch => {
    return voteRepository
      .findAllBySignatures(signaturesBatch)
      .then(map(({ id: voteId, signature }) => batchVoteRepository.create({ batchId, voteId, signature, transaction })));
  }, { concurrency: 2 });

  forceGCAndLog();
};

module.exports.batchVoteCreator = ({
  batchRepository,
  batchVoteRepository,
  config,
  db,
  enqueueMoveFile,
  logger = console,
  petitionRepository,
  voteRepository,
}) => async ({ anonymisedPdfKey, batchKey, normalPdfKey, cityId, uf, petitionId }) => {
  const s3 = new AWS.S3({
    region: config("AWS_REGION"),
    accessKeyId: config("AWS_ACCESSKEY_ID"),
    secretAccessKey: config("AWS_ACCESSKEY_SECRET"),
  });

  const signatureFileExist = pdfExists({ s3, bucket: config("AWS_BUCKET_PRIVATE") });
  const existenceResults = await Promise.all([
    anonymisedPdfKey,
    normalPdfKey,
  ].map(key => signatureFileExist({ key })));

  if (!all(Boolean, existenceResults)) {
    logger.info("PDF keys unreachable");
    return;
  }

  return db.transaction(async transaction => {
    const process = processJob({
      batchRepository,
      batchVoteRepository,
      petitionRepository,
      config,
      logger,
      s3,
      transaction,
      voteRepository,
    });

    await process({
      anonymisedPdfKey,
      batchKey,
      normalPdfKey,
      cityId,
      uf,
      petitionId,
    });

    return Promise.all([
      enqueueMoveFile({
        acl: "public-read",
        from: { bucket: config("AWS_BUCKET_PRIVATE"), key: anonymisedPdfKey },
        to: { bucket: config("AWS_BUCKET"), key: batchKey },
      }),

      enqueueMoveFile({
        acl: "private",
        from: { bucket: config("AWS_BUCKET_PRIVATE"), key: normalPdfKey },
        to: { bucket: config("AWS_BUCKET_PRIVATE"), key: batchKey },
      }),
    ]);
  });
};
