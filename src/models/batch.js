"use strict";

module.exports = batch => ({
  id: batch.id,
  cityId: batch.cityId,
  petitionId: batch.petitionId,
  anonymisedSignature: batch.anonymisedSignature,
  blockchainDate: batch.blockchainDate,
  key: batch.key,
  signature: batch.signature,
  status: batch.status,
  transactionDate: batch.transactionDate,
  transactionId: batch.transactionId,
  uf: batch.uf,
});
