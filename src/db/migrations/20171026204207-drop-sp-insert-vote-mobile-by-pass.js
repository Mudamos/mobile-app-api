"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.sequelize.query(`
      DROP procedure IF EXISTS \`SP_INSERT_VOTE_MOBILE_BY_PASS\`;
    `),

  down: (queryInterface, _Sequelize) =>
    queryInterface.sequelize.query(`
      CREATE PROCEDURE \`SP_INSERT_VOTE_MOBILE_BY_PASS\`(
      OUT id INT,
      IN p_petiton_id INT(11),
      IN p_signature VARCHAR(88),
      IN p_wallet_id VARCHAR(88),
      IN p_status BOOLEAN,
      IN p_vote_id_card VARCHAR(12),
      IN p_message VARCHAR(800),
      IN p_geoloc VARCHAR(30)
      )
      proc: BEGIN
        DECLARE lid_vote int;

        DECLARE CONTINUE HANDLER FOR 1062
          BEGIN
          ROLLBACK;
          SELECT CONCAT('Usuário já votou nesta petição') AS msg;
          END;

        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
        END;
          START TRANSACTION;

          INSERT INTO \`vote\`
            (\`PetitionId\`,
            \`Signature\`,
            \`WalletId\`,
            \`Status\`,
            \`VoteIdCard\`,
            \`Message\`,
            \`Geoloc\`)
          VALUES
            (p_petiton_id,
            p_signature,
            p_wallet_id,
            p_status,
                  p_vote_id_card,
            p_message,
            p_geoloc);

          SET @lid_vote = LAST_INSERT_ID();
          SET id = @lid_vote;
        COMMIT;

      END;
    `),
};
