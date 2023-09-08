var listErrors = require('../../libs/helpers/errors-list')
  , BlockchainModel = require('../models/blockchain/blockchain')
  , PetitionModel = require('../models/petition/petition')
  , BatchModel = require('../models/vote/batch')
  , SuccessModel = require('../../libs/models/response/success')
  , ValidationModel = require('../../libs/models/response/validation')
  , ValidateAttribute = require('../../libs/models/validate/attribute')
  , CacheRedis = require('../../config/initializers/cache-redis')
  , Cache = new CacheRedis();

const TraceModel = require('../../libs/models/log/trace');
const {
  originalMyIsRegisterSuccess,
  originalMyIsRegisterDuplicate,
  originalMyIsDocumentStatusSuccess,
} = require("../../src/utils");

class PetitionService {

  constructor() { }

  static register(petition) {
    petition.id_version = petition.id_version ? petition.id_version.toString() : null;
    petition.id_petition = petition.id_petition ? petition.id_petition.toString() : null;
    return ValidationModel.validateRequest('petition', 'ErrorPetitionCreate', petition)
      .then(sucess => {
        return PetitionModel.insert(petition)
      })
      .then(register => {
        return BlockchainModel.register(petition.sha)
          .then((blockchain_register) => {
            console.log("Register result: ", blockchain_register)
            if (originalMyIsRegisterSuccess(blockchain_register))
              return register;
            else if (originalMyIsRegisterDuplicate(blockchain_register))
              throw new ValidationModel('fail', 'validation', listErrors['ErrorPetitionExists'].message, [new ValidateAttribute('registro_blockchain', listErrors['ErrorPetitionExists'].message)], listErrors['ErrorPetitionExists'].errorCode);
            else
              throw new ValidationModel('fail', 'validation', listErrors['ErrorPetitionCreate'].message, [new ValidateAttribute('blockchin_error', listErrors['ErrorPetitionCreate'].message)], listErrors['ErrorPetitionCreate'].errorCode);
          })
          // The petition blockchain register return success even if it fails because we will retry register in startPetitionBlockchainVerify job
          .catch(async err => {
            console.log("Error on register petition blockchain: ", err);

            const message = err instanceof ValidationModel ? JSON.stringify(err.data) : err.message;

            await TraceModel.log("REGISTER-PETITION", message || "Error on registering the petition", JSON.stringify(petition), true).catch(() => {
              console.log("Failed to trace log:", petition);
            });
          });
      })
      .then(register => {
        return new SuccessModel('success', { 'blockchain': register });
      })
  }

  static status(digest) {
    return BatchModel.finBySignature(digest)
      .then(batch => {
        if (batch)
          digest = batch.signature;
        return BlockchainModel.status(digest)
          .then(register => {
            if (originalMyIsDocumentStatusSuccess(register)) {
              return new SuccessModel('success', { 'blockchain': register.data });
            } else {
              throw new ValidationModel('fail', 'validation', listErrors['ErrorPetitionNotFound'].message, [new ValidateAttribute('sha', listErrors['ErrorPetitionNotFound'].message)], listErrors['ErrorPetitionNotFound'].errorCode);
            }
          });
      })
  }

 static findAllBlockchainSignaturesProcessed(id_petition) {
    return Cache.getKey(id_petition)
      .then(signatures => {
        if (signatures) {
          signatures = JSON.parse(signatures);
          return new SuccessModel('success', { 'signatures': signatures });
        } else {
          return PetitionModel.findAllBlockchainSignaturesProcessed(id_petition)
            .then(signnatures_files => {
              if (signnatures_files) {
                return Cache.setKey(id_petition, JSON.stringify(signnatures_files),86400)
                  .then(signatures => {
                    if (signatures)
                      return new SuccessModel('success', { 'signatures': signnatures_files });
                  })
              } else {
                throw new ValidationModel('fail', 'validation', listErrors['ErrorPetitionNotFound'].message, [new ValidateAttribute('petition_id', listErrors['ErrorPetitionNotFound'].message)], listErrors['ErrorPetitionNotFound'].errorCode);
              }
            });
        }
      })
  }
}

module.exports = PetitionService;
