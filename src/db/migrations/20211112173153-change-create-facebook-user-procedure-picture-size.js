"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.sequelize.query(`
      DROP procedure IF EXISTS \`SP_INSERT_USER_FACEBOOK\`;

      CREATE PROCEDURE \`SP_INSERT_USER_FACEBOOK\`(
          OUT id 		   INT,
              IN  p_name         VARCHAR(300),
              IN  p_email        VARCHAR(300),
              IN  p_facebookId   VARCHAR(20),
              IN  p_picture      VARCHAR(500)
              )
      BEGIN
        DECLARE lid_user int;
        DECLARE lid_profile int;

          DECLARE CONTINUE HANDLER FOR 1062
          BEGIN
          ROLLBACK;
          SELECT CONCAT('duplicate keys (',p_email,') found') AS msg;
          END;

        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
        END;

          START TRANSACTION;

        INSERT INTO \`user\`
          (\`Name\`)
        VALUES
          (p_name);

        SET @lid_user = LAST_INSERT_ID();
          SET id = @lid_user;

        INSERT INTO \`profile\`
          (\`Email\`,
          \`Type\`,
          \`Status\`,
          \`ProfileId\`,
          \`Picture\`)
        VALUES
          (p_email,
          'facebook',
          1,
          p_facebookId,
          p_picture);

        SET @lid_profile = LAST_INSERT_ID();

        INSERT INTO \`user_profile\`
          (\`UserId\`,
          \`ProfileId\`)
        VALUES
          (@lid_user,
          @lid_profile);

        COMMIT;

      END;
    `),

  down: (queryInterface, _Sequelize) =>
    queryInterface.sequelize.query(`
      DROP procedure IF EXISTS \`SP_INSERT_USER_FACEBOOK\`;

      CREATE PROCEDURE \`SP_INSERT_USER_FACEBOOK\`(
          OUT id 		   INT,
              IN  p_name         VARCHAR(300),
              IN  p_email        VARCHAR(300),
              IN  p_facebookId   VARCHAR(20),
              IN  p_picture      VARCHAR(200)
              )
      BEGIN
        DECLARE lid_user int;
        DECLARE lid_profile int;

          DECLARE CONTINUE HANDLER FOR 1062
          BEGIN
          ROLLBACK;
          SELECT CONCAT('duplicate keys (',p_email,') found') AS msg;
          END;

        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
        END;

          START TRANSACTION;

        INSERT INTO \`user\`
          (\`Name\`)
        VALUES
          (p_name);

        SET @lid_user = LAST_INSERT_ID();
          SET id = @lid_user;

        INSERT INTO \`profile\`
          (\`Email\`,
          \`Type\`,
          \`Status\`,
          \`ProfileId\`,
          \`Picture\`)
        VALUES
          (p_email,
          'facebook',
          1,
          p_facebookId,
          p_picture);

        SET @lid_profile = LAST_INSERT_ID();

        INSERT INTO \`user_profile\`
          (\`UserId\`,
          \`ProfileId\`)
        VALUES
          (@lid_user,
          @lid_profile);

        COMMIT;

      END;
    `),
};
