"use strict";

module.exports = batchVote => ({
  id: batchVote.id,
  batchId: batchVote.batchId,
  voteId: batchVote.voteId,
  signature: batchVote.signature,
});
