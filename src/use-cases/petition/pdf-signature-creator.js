"use strict";

const AWS = require("aws-sdk");
const moment = require("moment");
const path = require("path");
const MudamosLibCrypto = require("mudamos-libcrypto");
const ScheduleHelper = require("../../../libs/helpers/schedule");
const LogModel = require("../../../libs/models/log/log");
const PDFCreate = require("../../../app_v1/services/schedule-pdf");
const SignHelper = require("../../../libs/helpers/sign");

const {
  all,
  any,
  anyPass,
  dropLast,
  endsWith,
  equals,
  filter,
  head,
  isEmpty,
  join,
  last,
  map,
  pipe,
  prop,
  replace,
  reject,
  split,
  take,
} = require("ramda");

const {
  forceGCAndLog,
  generateHash,
} = require("../../utils");

const {
  Petition: {
    isCityNationalCause,
    isNationalCause,
  },
} = require("../../models");

const UserHelper = require("../../../libs/helpers/user");

const allReady = all(prop("status"));
const getIds = map(prop("id"));
const absolutePath = givenPath => path.resolve(__dirname, "../../../", givenPath);
const buildLink = (host, ...args) => {
  host = endsWith("/", host) ? host : `${host}/`;

  return args.length > 1
    ? `${host}${dropLast(1, args).join("/")}/${last(args)}`
    : `${host}${take(1, args)}`;
};

const generateBatchKey = key =>
  pipe(
    replace("pdf-creation", ""),
    replace("normal", ""),
    replace("anonymised", ""),
    split("/"),
    reject(isEmpty),
    join("/")
  )(key);

const hasPageCover = ({ s3, bucket }) => async ({ id }) => {
  const objects = await s3.listObjectsV2({
    Bucket: bucket,
    MaxKeys: 1,
    Prefix: `images/petition/${id}/${id}_1.png`,
  }).promise();

  return objects.KeyCount > 0;
};

const coversFetcher = ({ s3, bucket }) => async ({ id }) => {
  const objects = await s3.listObjectsV2({
    Bucket: bucket,
    Prefix: `images/petition/${id}/${id}_`,
  }).promise()
    .then(prop("Contents"))
    .then(map(prop("Key")))
    .then(filter(endsWith(".png")));

  return Promise.all(objects.map(Key => s3.getObject({ Bucket: bucket, Key }).promise()));
};

const fileUploader = ({ s3, bucket }) => ({ file, key }) =>
  s3.upload({ Body: file, Bucket: bucket, Key: key }).promise();

const generateHashForKey = ({ s3, bucket }) => async ({ key }) =>
  s3.getObject({ Bucket: bucket, Key: key }).promise()
    .then(({ Body }) => generateHash(Body));

const processJobWith = ({ config, logger, s3, voteRepository }) => async ({ petitions, cityId, uf }) => {
  const fetchPageCovers = coversFetcher({ s3, bucket: config("AWS_URL_IMG_BUCKET") });
  const petition = last(petitions);
  const petitionIds = getIds(petitions);
  const votes = await voteRepository.allVotesByPetitionIds({ petitionIds, cityId, uf });

  const covers = await fetchPageCovers({ id: petition.petitionId });
  const generatePDF = pdfGenerator({ config, covers, petition });
  const uploadFile = fileUploader({ s3, bucket: config("AWS_BUCKET_PRIVATE") });
  const getHash = generateHashForKey({ s3, bucket: config("AWS_BUCKET_PRIVATE") });

  const subfolderForPetitionType = () => {
    if (!isNationalCause(petition)) return "all";
    if (isCityNationalCause(petition)) return cityId;
    return uf;
  };

  const buildPdfKey = ({ anonymised }) => ([
    "pdf-creation",
    petition.petitionId,
    subfolderForPetitionType(),
    anonymised ? "anonymised" : "normal",
    moment().format("YYYY"),
    moment().format("MM"),
    moment().format("DD"),
    `${petition.petitionId}-${moment().format("YYYYMMDDHHmmss")}.pdf`,
  ].join("/"));

  const normalPdfKey = buildPdfKey({ anonymised: false });
  const anonymisedPdfKey = buildPdfKey({ anonymised: true });

  const processVotes = async ({ anonymised }) => {
    const { signatures, invalidVotes } = await buildSignatures({ config })({ votes, anonymised });

    if (invalidVotes.length) {
      await LogModel.log("PROCESS-VOTES-SIGN-VERIFY", JSON.stringify(invalidVotes), "PROCESS-VOTES-SIGN-VERIFY-ERROR", true);
    }

    const transformedSignatures = await ScheduleHelper.transformOptions({ lines: signatures });

    const normalFileHash = anonymised ? await getHash({ key: normalPdfKey }) : null;
    logger.info("Normal file hash:", normalFileHash);

    logger.info("Generating pdf for petition:", petition.petitionId, "anonymised:", anonymised);
    const pdf = await generatePDF({ anonymised, signatures: transformedSignatures, normalFileHash });

    const key = anonymised ? anonymisedPdfKey : normalPdfKey;
    logger.info("Uploading pdf for petition:", petition.petitionId, "anonymised:", anonymised, key);
    await uploadFile({ file: pdf, key });
  };

  await processVotes({ anonymised: false });
  forceGCAndLog();

  await processVotes({ anonymised: true });
  forceGCAndLog();

  return {
    anonymisedPdfKey,
    normalPdfKey,
  };
};

const buildSignatures = ({ config }) => async ({ votes, anonymised }) => {
  const signatures = [];
  const invalidVotes = [];
  const joinner = join(";");
  const addSpaces = val => `\u0020\u0020${val}\u0020\u0020\u0020`;
  const buildMessage = pipe(dropLast(1), joinner, addSpaces);
  const buildSignature = (vote, messageTokens) => ({
    link: buildLink(config("PDF_SIGNATURE_VALIDATION_URL"), SignHelper.toHex(vote.signature)),
    location: {
      city: vote.cityName,
      district: vote.district,
      state: vote.state,
      uf: vote.uf,
    },
    message: buildMessage(messageTokens),
  });

  // Code derived from app_v1/services/schedule-file#processFile
  votes.forEach(vote => {
    const messageTokens = vote.message.split(";");
    const publicKey = messageTokens[6];
    const signature = messageTokens[7];
    const signatureMessage = pipe(take(6), joinner)(messageTokens);
    const invalidChar = String.fromCharCode(8203);

    const hasInvalidChar = anyPass([
      any(equals(invalidChar)),
      pipe(UserHelper.clearChar, isEmpty),
    ])(head(messageTokens) || []);

    try {
      if (hasInvalidChar || !MudamosLibCrypto.verifyMessage(publicKey, signatureMessage, signature)) {
        invalidVotes.push(vote);
      } else {
        if (anonymised) {
          const replacement = "X";
          messageTokens[0] = UserHelper.getNameAnonymised(messageTokens[0], replacement);
          messageTokens[1] = UserHelper.getZipCodeAnonymised(messageTokens[1], replacement);
          messageTokens[2] = UserHelper.getVoteIdCardAnonymised(messageTokens[2], replacement);
        }

        signatures.push(buildSignature(vote, messageTokens));
      }
    } catch (err) {
      invalidVotes.push(vote);
    }
  });

  return {
    signatures,
    invalidVotes,
  };
};

const pdfGenerator = ({ config, covers, petition }) => async ({ anonymised, normalFileHash, signatures }) => {
  const options = {
    marging_left: 30,
    margin_left_subtitle: 15,
    lines: signatures,
    margins: {
      top: 0.50,
      bottom: 0.50,
      left: 0.50,
      right: 0.50,
    },
    lines_page: parseInt(config("PDF_LINES_PER_PAGE"), 10),
    font: {
      path: absolutePath(config("PDF_DEFAULT_FONT_PATH")),
      path_mudamos: absolutePath(config("PDF_MUDAMOS_FONT_PATH")),
      path_mudamo_bold: absolutePath(config("PDF_MUDAMOS_BOLD_FONT_PATH")),
      size: 5.5,
    },
    petition_id: petition.petitionId,
    position: {
      top: 0.50,
      bottom: 0.50,
      left: 0.50,
      right: 0.50,
    },
    petition_name: petition.name,
    petition_url: petition.pageUrl,
    petiton_date: petition.transactionDate ? moment(petition.transactionDate).format("DD/MM/YYYY") : "",
  };

  const pdf = new PDFCreate(options);
  if (anonymised) {
    await pdf.addCoverAnonymisedPage(0, normalFileHash);
  } else {
    await pdf.addCoverPage(0);
  }

  await pdf.addPageFacePetitionInfo(covers.map(prop("Body")));
  await pdf.processLines();
  pdf.doc.end();

  return pdf.doc;
};

module.exports.pdfSignatureCreator = ({
  config,
  enqueueBatchVoteCreation,
  enqueuePdfCreation,
  logger = console,
  petitionRepository,
  voteRepository,
}) => async ({ cityId, petitionId, uf }) => {
  const versions = await petitionRepository.findAllByPetitionId(petitionId);
  const petition = last(versions);
  const petitionIds = getIds(versions);

  if (!petition) {
    logger.info("Petition not found");
    return;
  }

  if (!allReady(versions)) {
    logger.info("Petition id:", petitionId, "not ready yet");
    return;
  }

  if (!isNationalCause(petition)) {
    logger.info("Skipping petition. Only national cause is allowed.");
    return;
  }

  const s3 = new AWS.S3({
    region: config("AWS_REGION"),
    accessKeyId: config("AWS_ACCESSKEY_ID"),
    secretAccessKey: config("AWS_ACCESSKEY_SECRET"),
  });

  const hasCover = await hasPageCover({ s3, bucket: config("AWS_URL_IMG_BUCKET") })({ id: petitionId });
  if (!hasCover) {
    logger.info("Petition id:", petitionId, "has no covers");
    return;
  }

  const jobProcessor = processJobWith({
    config,
    logger,
    s3,
    voteRepository,
  });

  if (cityId || uf) {
    const { anonymisedPdfKey, normalPdfKey } = await jobProcessor({ petitions: versions, cityId, uf });
    await enqueueBatchVoteCreation({
      anonymisedPdfKey,
      batchKey: generateBatchKey(normalPdfKey),
      normalPdfKey,
      petitionId,
      cityId,
      uf,
    });
  } else if (isCityNationalCause(petition)) {
    const cityIds = await voteRepository.findCityIdsByPetitionIds(petitionIds);
    await Promise.all(cityIds.map(cityId => enqueuePdfCreation({ id: petitionId, cityId })));
  } else {
    const ufs = await voteRepository.findUfsByPetitionIds(petitionIds);
    await Promise.all(ufs.map(uf => enqueuePdfCreation({ id: petitionId, uf })));
  }
};
