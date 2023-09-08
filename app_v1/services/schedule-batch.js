const nconf = require('nconf');
const path = require('path');
const _ = require('lodash');
const config = require('nconf');
const MudamosLibCrypto = require('mudamos-libcrypto');
const SchedulePDF = require('./schedule-pdf');
const SendFileAWS = require('../../libs/helpers/send-file-aws');
const fs = require('fs');

require('dotenv').load({ silent: true });
// nconf.overrides({
// 	'DB_CONNECTIONS_LIMIT': '10'
// });

nconf
	.use('memory')
	.argv()
	.env();

const BlockchainModel = require('../models/blockchain/blockchain');
const BatchModel = require('../models/vote/batch');
const VoteModel = require('../models/vote/vote');
// const Connection = require('../../config/initializers/database');

const {
  head,
  pipe,
  prop,
} = require("ramda");

const appConfig = require("../../config")();
const db = require("../../src/db")(appConfig);
const {
  batchRepository: BatchRepository,
  petitionRepository: PetitionRepository,
  voteRepository: VoteRepository,
} = require("../../src/repositories");

const { originalMyIsRegisterSuccess } = require("../../src/utils");

const batchRepository = BatchRepository(db);
const petitionRepository = PetitionRepository(db);
const voteRepository = VoteRepository(db);

const {
  logCreator,
} = require("../../src/services");
const { logger } = logCreator(appConfig);

async function createBatchFile(pathFile) {
  var _sha;
  var _shaAnonymised;
  var _votes;

  if (pathFile.indexOf('anonymised') < 0) {
    let lines = await SchedulePDF.loadPDF(path.resolve(__dirname, config.get('PDF_FOLDER')).concat(pathFile));
    _.each(lines, (line) => {
      var splitMessage = line.split(';');
      if (!MudamosLibCrypto.verifyMessage(splitMessage[6], [splitMessage[0], splitMessage[1], splitMessage[2], splitMessage[3], splitMessage[4], splitMessage[5]].join(";"), splitMessage[7])) {
        validate = false;
      }
    })

    let promisseSignatures = [];

    if (lines.length) {
      var signatures = _.map(lines, (line) => { return `'${line.split(';')[7]}'` });
      delete lines;
      var div = Math.ceil(signatures.length / 1000);
      for (var i = 0; i < div; ++i) {
        var init = i === 0 ? 0 : (i * 1000);
        var finish = i === 0 ? 1000 : (i + 1) * 1000;
        var signatures_select = signatures.slice(init, finish);
        promisseSignatures.push( await VoteModel.findBySignatures(signatures_select));
      }
    } else {
      logger.info("Invalid signatures", pathFile);
      throw new Error(`Assinaturas inválidas ${pathFile}`);
    }

    let votes = [].concat.apply([], promisseSignatures);
    let sha = await SchedulePDF.generateSHA256(path.resolve(__dirname, config.get('PDF_FOLDER')).concat(pathFile));

    var pathAnonymised = pathFile.split('/');
    pathAnonymised[pathAnonymised.length - 1] = `anonymised/${pathAnonymised[pathAnonymised.length - 1]}`;
    pathAnonymised = pathAnonymised.join('/');
    let _shaAnonymised = await SchedulePDF.generateSHA256(path.resolve(__dirname, config.get('PDF_FOLDER')).concat(pathAnonymised));

    let SendFile = new SendFileAWS(path.resolve(__dirname, config.get('PDF_FOLDER')).concat(pathFile));
    let pathFileAws = await SendFile.send(config.get('AWS_BUCKET_PRIVATE'), "private");
    logger.info("Sent file to s3 private", pathFile);

    if (pathFileAws) {
      logger.info("Will blockchain register", sha, pathFile);
      const register = await BlockchainModel.register(sha);
      if (originalMyIsRegisterSuccess(register)) {
        logger.info("Success registering", pathFile);
        const petition = await voteRepository.findById(pipe(head, prop("vote_id"))(votes))
          .then(({ petitionId }) => petitionRepository.findById(petitionId));

        const batch = await batchRepository.create({
          key: pathFile,
          signature: sha,
          anonymisedSignature: _shaAnonymised,
          petitionId: petition.id,
          cityId: petition.cityId,
          uf: petition.uf,
        });

        logger.info("Batch vote created", pathFile);

        return await BatchModel.InsertVotesInBacth(batch.id, _.map(votes, 'vote_id'))
      } else {
        logger.info("Error registering. Not success", pathFile);
        return false;
      }
    } else {
      return false;
    }
  } else {
    var SendFile = new SendFileAWS(path.resolve(__dirname, config.get('PDF_FOLDER')).concat(pathFile));
    let pathFileAwsAnonymised = await SendFile.send(config.get('AWS_BUCKET'), "public-read");
    if(pathFileAwsAnonymised)
      return true;
  }
}

class ScheduleBatch {

	static async startGenerateBatch() {

		function filesRecursive(dir) {
			var results = []
			var list = fs.readdirSync(dir);
			_.each(list, file => {
				file = `${dir}/${file}`;
				var stat = fs.statSync(file);
				if (stat && stat.isDirectory()) {
					results = results.concat(filesRecursive(file))
				} else {
					results.push(file)
				}
			})
			return results;
		}

		var pdfFolders = path.resolve(__dirname, config.get('PDF_FOLDER'));
		var files = filesRecursive(pdfFolders);

		if (files.length) {
			files = _.filter(files, (file) => { return file.indexOf('.pdf') > 0 });
			files = _.map(files, (file) => {
				return file.substr(file.indexOf('pdf_process') + 11, file.length);
			})
			var processBatch = [];
			let filesDB = await BatchModel.verifyFileProcess(files);
			for (let file of files) {
				if (!_.find(filesDB, (fileSearch) => _.last(fileSearch.File.split('/')) == _.last(file.split('/')))) {
					console.log('GenerateBatch ' + file)
          try {
            let _batch = await createBatchFile(file);
            logger.info("Completed createBatchFile", file)
            processBatch.push(_batch)
          } catch (e) {
            logger.info("Error while createBatchFile", file, e.message, e.stack, e);
          }
				}
			}
			var result = true;
			_.each(processBatch, item => {
				if (!item)
					result = false;
			})
			return result;
		}
	}
}

module.exports = ScheduleBatch;
