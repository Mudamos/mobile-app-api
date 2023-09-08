"use strict";

module.exports = {
  BatchVoteCreatorWorker: require("./batch-vote-creator"),
  PDFSignatureCreatorWorker: require("./pdf-signature-creator"),
  FileMoverWorker: require("./s3-file-mover"),
  MessageSignIntegratorCallbackWorker: require("./message-sign-integrator-callback-notifier"),
};
