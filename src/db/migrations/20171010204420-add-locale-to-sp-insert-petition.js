"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.sequelize.query(`
      DROP procedure IF EXISTS \`SP_INSERT_PETITION\`;

      CREATE PROCEDURE \`SP_INSERT_PETITION\`(
      OUT id      INT,
      IN p_idVersion  INT,
      IN p_idPetition INT,
      IN p_status tinyint(1),
      IN p_name  VARCHAR(200),
      IN p_sha VARCHAR(64),
      IN p_url  VARCHAR(200),
      IN p_page_url  VARCHAR(200),
      IN p_scopeCoverage VARCHAR(255),
      IN p_uf VARCHAR(2),
      IN p_cityId INT
      )
      proc: BEGIN
        DECLARE idPetition int;
        DECLARE idVersion int;
        DECLARE IdSha int;
        DECLARE ErrorValidate boolean;

        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
        END;

          SET @ErrorValidate = false;

          SET  @IdSha = (SELECT p.Id FROM petition AS p WHERE p.DigSig = p_sha COLLATE utf8_unicode_ci );

          IF not @IdSha is null THEN
          SET @ErrorValidate = true;
          SIGNAL SQLSTATE '01000'
          SET MESSAGE_TEXT = 'Documento já existe';
          SHOW WARNINGS;

        END IF;

          SET @idVersion = (SELECT p.Id FROM petition AS p WHERE p.idVersion = p_idVersion limit 1);

          IF @idVersion != 0  OR not @idVersion is null THEN
          SET @ErrorValidate = true;
              SIGNAL SQLSTATE '01001'
          SET MESSAGE_TEXT = 'Petição já eiste' ;
          SHOW WARNINGS;

        END IF;


        IF @ErrorValidate = false THEN

          START TRANSACTION;

          INSERT INTO petition (\`IdVersion\`, \`IdPetition\`, \`Status\`, \`Name\`, \`DigSig\`, \`Url\`, \`PageUrl\`, \`ScopeCoverage\`, \`Uf\`, \`CityId\`) VALUES (p_idVersion, p_idPetition, p_status, p_name, p_sha, p_url, p_page_url, p_scopeCoverage, p_uf, p_cityId);

          SET id = LAST_INSERT_ID();

          COMMIT;

          END IF;

      END;
    `),

  down: (queryInterface, _Sequelize) =>
    queryInterface.sequelize.query(`
      DROP procedure IF EXISTS \`SP_INSERT_PETITION\`;

      CREATE PROCEDURE \`SP_INSERT_PETITION\`(
      OUT id      INT,
      IN p_idVersion  INT,
      IN p_idPetition INT,
      IN p_status tinyint(1),
      IN p_name  VARCHAR(200),
      IN p_sha VARCHAR(64),
      IN p_url  VARCHAR(200),
      IN p_page_url  VARCHAR(200)
      )
      proc: BEGIN
        DECLARE idPetition int;
        DECLARE idVersion int;
        DECLARE IdSha int;
        DECLARE ErrorValidate boolean;

        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
        END;

          SET @ErrorValidate = false;

          SET  @IdSha = (SELECT p.Id FROM petition AS p WHERE p.DigSig = p_sha COLLATE utf8_unicode_ci );

          IF not @IdSha is null THEN
          SET @ErrorValidate = true;
          SIGNAL SQLSTATE '01000'
          SET MESSAGE_TEXT = 'Documento já existe';
          SHOW WARNINGS;

        END IF;

          SET @idVersion = (SELECT p.Id FROM petition AS p WHERE p.idVersion = p_idVersion limit 1);

          IF @idVersion != 0  OR not @idVersion is null THEN
          SET @ErrorValidate = true;
              SIGNAL SQLSTATE '01001'
          SET MESSAGE_TEXT = 'Petição já eiste' ;
          SHOW WARNINGS;

        END IF;


        IF @ErrorValidate = false THEN

          START TRANSACTION;

          INSERT INTO petition (\`IdVersion\`, \`IdPetition\`, \`Status\`, \`Name\`, \`DigSig\`, \`Url\`, \`PageUrl\`) VALUES (p_idVersion, p_idPetition, p_status, p_name, p_sha, p_url, p_page_url);

          SET id = LAST_INSERT_ID();

          COMMIT;

          END IF;

      END;
    `),
};
