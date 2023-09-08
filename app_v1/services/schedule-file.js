const nconf = require('nconf');
const path = require('path');
const _ = require('lodash');
const config = require('nconf');
const moment = require('moment');
const fs = require('fs');
const MudamosLibCrypto = require('mudamos-libcrypto');
const async = require('async');

const ScheduleHelper = require('../../libs/helpers/schedule');

require('dotenv').load({ silent: true });
// nconf.overrides({
// 	'DB_CONNECTIONS_LIMIT': '10'
// });


nconf
	.use('memory')
	.argv()
	.env();

const ReadFileAWS = require('../../libs/helpers/read-file-aws');
const UserHelper = require('../../libs/helpers/user')
const VoteModel = require('../models/vote/vote');
const PetitionModel = require('../models/petition/petition');
const LogModel = require('../../libs/models/log/log');
const PDFCreate = require('./schedule-pdf');
const ScheduleBatch = require('./schedule-batch');
const SchedulePDF = require('./schedule-pdf');

const {
  head,
} = require("ramda");

const appConfig = require("../../config")();
const db = require("../../src/db")(appConfig);
const {
  petitionRepository,
} = require("../../src/repositories");

const {
  Petition: { isNationalCause },
} = require("../../src/models");

const {
  logCreator,
  Queue,
} = require("../../src/services");

const { logger } = logCreator(appConfig);
const queue = Queue(appConfig);

const shouldEnqueueByPetitionId = async id => {
  const petition = await petitionRepository(db).findById(id);
  return isNationalCause(petition);
};

async function processFile(votes, petition) {

	async function getOptions(votes, pathFile, anonymised, petition) {
		var votesParse = [];
		var errorVotesParse = [];
		_.each(votes, vote => {

			var splitMessage = vote.vote_message.split(';');

			var checkInvalidCharset = false;

			for (var i = 0; i < splitMessage[0].length; i++) {
				if (splitMessage[0].charCodeAt(i) == 8203)
					checkInvalidCharset = true;
			}

			if (UserHelper.clearChar(splitMessage[0]) == '')
				checkInvalidCharset = true;

			try {
				if (checkInvalidCharset || !MudamosLibCrypto.verifyMessage(splitMessage[6], [splitMessage[0], splitMessage[1], splitMessage[2], splitMessage[3], splitMessage[4], splitMessage[5]].join(";"), splitMessage[7])) {
					errorVotesParse.push(vote);
				} else {
					if (anonymised) {
						splitMessage[0] = UserHelper.getNameAnonymised(splitMessage[0], 'X');
						splitMessage[1] = UserHelper.getZipCodeAnonymised(splitMessage[1], 'X');
						splitMessage[2] = UserHelper.getVoteIdCardAnonymised(splitMessage[2], 'X');
					}
					var message = splitMessage.slice(0, splitMessage.length - 1)

					votesParse.push({ message: `\u0020\u0020${message.join(';')}\u0020\u0020\u0020`, link: vote.link_vote_signature, location: { state: vote.user_state, uf: vote.user_uf, city: vote.user_city, district: vote.user_district } });
				}
			} catch (err) {
				errorVotesParse.push(vote);
			}
		});


    if (errorVotesParse && errorVotesParse.length > 0)
			async.queue(LogModel.log('PROCESS-VOTES-SIGN-VERIFY', JSON.stringify(errorVotesParse), 'PROCESS-VOTES-SIGN-VERIFY-ERROR', true), 1);

		var options = {
			marging_left: 30
			, margin_left_subtitle: 15
			, lines: votesParse
			, margins: {
				top: 0.50
				, bottom: 0.50
				, left: 0.50
				, right: 0.50
			}
			, path: pathFile
			, lines_page: parseInt(config.get('PDF_LINES_PER_PAGE'), 10)
			, font: {
				path: path.resolve(__dirname, config.get('PDF_FONT'))
				, path_mudamos: path.resolve(__dirname, config.get('PDF_FONT_MUDAMOS'))
				, path_mudamo_bold: path.resolve(__dirname, config.get('PDF_FONT_MUDAMOS_BOLD'))
				, size: 5.5
			}
			, petition_id: petition.petition_id
			, position: {
				top: 0.50
				, bottom: 0.50
				, left: 0.50
				, right: 0.50
			}
			, petition_name: petition.petition_name
			, petition_url: petition.petition_page_url
			, petiton_date: petition.petition_tx_stamp ? moment(petition.petition_tx_stamp).format('DD/MM/YYYY') : ""
		}
		return options;

	}

	var dir = path.resolve(__dirname, `${config.get('PDF_FOLDER')}${petition.petition_id}/${moment().format('YYYY')}/${moment().format('MM')}/${moment().format('DD')}`).replace(/[\\"]/g, '/');
	var file = `/${petition.petition_id}-${moment().format('YYYYMMDDHHmmss')}.pdf`;

  logger.info(`Will parse options for ${votes.length} votes`);
	var options = await getOptions(votes, dir.concat(file), false, petition);

	if (!options.lines.length) {
    logger.info("No lines to add, bailing", petition);
		return false;
	} else {
		options.lines = ScheduleHelper.transformOptions(options);
		await ScheduleHelper.fileExists(dir);
		console.log('GeneratePDFSign ' + petition.petition_id);
		await ScheduleFile.generatePDFSign(options, false);
    logger.info("Generated pdf", petition.petition_id);

		await ScheduleHelper.fileExists(dir.concat('/anonymised'));
		console.log('GeneratePDFSign anonymised ' + petition.petition_id);
		var options_anonymised = await getOptions(votes, dir.concat('/anonymised', file), true, petition);
		options_anonymised.lines = ScheduleHelper.transformOptions(options_anonymised);
		await ScheduleFile.generatePDFSign(options_anonymised, true);
    logger.info("Generated anonymised pdf", petition.petition_id);
	}
}

async function processFileByRange(votes, startRange, finishRange, petition) {

	if (startRange === 0)
		startRange += 1;
	finishRange += 1;

	async function getOptions(votes, pathFile, anonymised, petition) {

		var votesParse = [];
		var errorVotesParse = [];
		_.each(votes, vote => {

			var splitMessage = vote.vote_message.split(';');

			var checkInvalidCharset = false;

			for (var i = 0; i < splitMessage[0].length; i++) {
				if (splitMessage[0].charCodeAt(i) == 8203)
					checkInvalidCharset = true;
			}

			if (UserHelper.clearChar(splitMessage[0]) == '')
				checkInvalidCharset = true;

			try {
				if (checkInvalidCharset || !MudamosLibCrypto.verifyMessage(splitMessage[6], [splitMessage[0], splitMessage[1], splitMessage[2], splitMessage[3], splitMessage[4], splitMessage[5]].join(";"), splitMessage[7])) {
					errorVotesParse.push(vote);
				} else {
					if (anonymised) {
						splitMessage[0] = UserHelper.getNameAnonymised(splitMessage[0], 'X');
						splitMessage[1] = UserHelper.getZipCodeAnonymised(splitMessage[1], 'X');
						splitMessage[2] = UserHelper.getVoteIdCardAnonymised(splitMessage[2], 'X');
					}
					var message = splitMessage.slice(0, splitMessage.length - 1)

					votesParse.push({ message: `\u0020\u0020${message.join(';')}\u0020\u0020\u0020`, link: vote.link_vote_signature, location: { state: vote.user_state, uf: vote.user_uf, city: vote.user_city, district: vote.user_district } });
				}
			} catch (err) {
				errorVotesParse.push(vote);
			}
		});

		if (errorVotesParse.length)
			async.queue(LogModel.log('PROCESS-VOTES-SIGN-VERIFY', JSON.stringify(errorVotesParse), 'PROCESS-VOTES-SIGN-VERIFY-ERROR', true), 1);
		var options = {
			marging_left: 30
			, margin_left_subtitle: 15
			, lines: votesParse
			, margins: {
				top: 0.50
				, bottom: 0.50
				, left: 0.50
				, right: 0.50
			}
			, path: pathFile
			, lines_page: parseInt(config.get('PDF_LINES_PER_PAGE'), 10)
			, font: {
				path: path.resolve(__dirname, config.get('PDF_FONT'))
				, path_mudamos: path.resolve(__dirname, config.get('PDF_FONT_MUDAMOS'))
				, path_mudamo_bold: path.resolve(__dirname, config.get('PDF_FONT_MUDAMOS_BOLD'))
				, size: 5.5
			}
			, petition_id: petition.petition_id
			, position: {
				top: 0.50
				, bottom: 0.50
				, left: 0.50
				, right: 0.50
			}
			, petition_name: votes[0].petition_name
			, petition_url: votes[0].petition_page_url
			, petiton_date: votes[0].petition_tx_stamp ? moment(votes[0].petition_tx_stamp).format('DD/MM/YYYY') : ""
		}
		return options;
	}



	if (votes.length) {
		var dir = path.resolve(__dirname, `${config.get('PDF_FOLDER')}${petition.petition_id}/${moment().format('YYYY')}/${moment().format('MM')}/${moment().format('DD')}`).replace(/[\\"]/g, '/');
		var file = `/${petition.petition_id}-${moment().format('YYYYMMDDHHmmss')}-${startRange}-${finishRange}.pdf`;

		let options = await getOptions(votes, dir.concat(file), false, petition)
		if (!options.lines.length) {
			return false;
		} else {
			console.log('GeneratePDFSign ' + petition.petition_id);
			options.lines = ScheduleHelper.transformOptions(options, startRange);
			await ScheduleHelper.fileExists(dir)
			await ScheduleFile.generatePDFSign(options, false);

			await ScheduleHelper.fileExists(dir.concat('/anonymised'));
			console.log('GeneratePDFSign  anonymised' + petition.petition_id);
			var options_anonymised = await getOptions(votes, dir.concat('/anonymised', file), true, petition);
			options_anonymised.lines = ScheduleHelper.transformOptions(options_anonymised, startRange);
			await ScheduleFile.generatePDFSign(options_anonymised, true);
			return true;
		}
	}
}

class ScheduleFile {

	static async generatePDFSign(options, anonymised) {
		if (anonymised) {
			var sha = await SchedulePDF.generateSHA256(options.path.replace('/anonymised', ''));
			var pdf = new PDFCreate(options);
			await pdf.addCoverAnonymisedPage(0, sha);
			await pdf.addPageFacePetitionInfo();
			await pdf.processLines();
			await pdf.close();
			return true;
		} else {
			var pdf = new PDFCreate(options);
			await pdf.addCoverPage(0, false, '');
			await pdf.addPageFacePetitionInfo();
			await pdf.processLines();
			await pdf.close();
			return true;
		}
	}

	static parseResult(contextValue) {

		var lines = contextValue.split('.\u0020\u0020');
		var result = [];
		_.each(lines, element => {
			var rgx = /( {2})(.*?)( {3})/g;
			element = element.match(rgx) ? element.match(rgx)[0].replace(' ', '') : null;
			if (element) {
				result.push(element)
			}
		});
		return result;
	}

  static async startFileProcess(groupVotes) {
    try {
      logger.info('startFileProcess')
      var ReadFile = new ReadFileAWS();
      var verifyBatch = false;
      let _listPeition = await VoteModel.findAllPDFGroup();

      logger.info("Petitions pdf group", _listPeition);

      for (let item of _listPeition) {
        const petitions = await PetitionModel.findByPetitionId(item.IdPetition);
        logger.info("Petitions to be generated", petitions);

        if (!petitions.length) continue;

        const petitionId = head(petitions).id_petition;
        if (await shouldEnqueueByPetitionId(petitionId)) {
          logger.info(`Skipping national cause id ${petitionId}`);
        } else {
          logger.info("Will read covers from s3 for", item);
          await ReadFile.readFolder(`${config.get('AWS_URL_IMG_BUCKET')}`, `images/petition/${item.IdPetition}/`, path.resolve(__dirname, `${config.get('PDF_IMAGE_TEMPLATE')}`), '.png');
          logger.info("Covers read");

          if (petitions.every(petition => petition.petition_status == 1) && fs.existsSync(path.resolve(__dirname, `${config.get('PDF_IMAGE_TEMPLATE')}/images/petition/${petitions[0].petition_id}`))) {
            logger.info("All statuses confirmed and covers fetched for", petitions[0].petition_id)

            let votes = await VoteModel.findAllPDFByPetition(petitions.map(item => item.id_petition));
            await processFile(votes, petitions[0]);
            verifyBatch = true;
          }
        }
      }

      if (verifyBatch) {
        logger.info("Will startGenerateBatch");
        await ScheduleBatch.startGenerateBatch();
        logger.info("Done startGenerateBatch");
      }

      logger.info('Finished startFileProcess')
    } catch (err) {
      logger.info("startFileProcess exception: ", err);
    }
  }

  static async startFileProcessByPetition(petition_id) {
    try {
      logger.info("startFileProcess");

      const petitions = await PetitionModel.findByPetitionId(petition_id);
      if (!petitions.length) return;

      const petitionId = head(petitions).id_petition;
      if (await shouldEnqueueByPetitionId(petitionId)) {
        return queue.enqueuePdfCreation({ id: petition_id });
      }

      var ReadFile = new ReadFileAWS();
      var verifyBatch = false;

      await ReadFile.readFolder(`${config.get('AWS_URL_IMG_BUCKET')}`, `images/petition/${petition_id}/`, path.resolve(__dirname, `${config.get('PDF_IMAGE_TEMPLATE')}`), '.png');
      if (petitions.every(petition => petition.petition_status == 1) && fs.existsSync(path.resolve(__dirname, `${config.get('PDF_IMAGE_TEMPLATE')}/images/petition/${petition_id}`))) {
        let votes = await VoteModel.findAllPDFByPetition(petitions.map(item => item.id_petition));
        let process = await processFile(votes, petitions[0]);
        verifyBatch = true;
      }

      if (verifyBatch)
        await ScheduleBatch.startGenerateBatch();

      console.log('Finish')
    } catch (err) {
      console.log(err)
    }
  }

  static async startFileProcessByRange(qtdRange) {
    var processPetitions = [];
    var processImages = [];
    var processFiles = [];
    var resultsPetition;
    var ReadFile = new ReadFileAWS();
    let verifyBatch = false;

    console.log('startFileProces')
    let petitions = await PetitionModel.findAllActive();
    for (let petition of petitions) {
      let petitionsList = await PetitionModel.findByPetitionId(petition.petition_id);
      if (!petitionsList.length) continue;

      const petitionId = head(petitionsList).id_petition;
      if (petitionsList.length && await shouldEnqueueByPetitionId(petitionId)) {
        logger.info(`Skipping national cause id ${petitionId}`);
      } else {
        await ReadFile.readFolder(`${config.get('AWS_URL_IMG_BUCKET')}`, `images/petition/${petitionsList[0].petition_id}/`, path.resolve(__dirname, `${config.get('PDF_IMAGE_TEMPLATE')}`), '.png');
        var timesRange = Math.floor(petition.qtd_votes / qtdRange) + 1;
        for (var i = 0; i < timesRange; i++) {
          var init = i === 0 ? 0 : (i * qtdRange);
          var finish = i === 0 ? qtdRange - 1 : ((i + 1) * qtdRange) - 1;
          processPetitions.push( { rows : await VoteModel.findAllPDFByRangeAndPetition(petitionsList.map(item => item.id_petition), init, finish, qtdRange), start_range : init , finish_range : finish} );
        }

        for (let itemVotes of processPetitions) {
          if (itemVotes && itemVotes.rows) {
            processFiles.push(processFileByRange(itemVotes.rows, itemVotes.start_range, itemVotes.finish_range, petitionsList[0]));
            verifyBatch = true;
          }
        }
      }
    }

    if (verifyBatch) {
      await ScheduleBatch.startGenerateBatch();
    }
    console.log('Finish');
  }
}

module.exports = ScheduleFile;
