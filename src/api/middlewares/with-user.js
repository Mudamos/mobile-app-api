"use strict";

module.exports = ({ passport, UserProfile, userRepository }) => ({ includeLegacy = false } = {}) => (req, res, next) =>
  passport.authenticate("bearer", { session: false }, async (err, user) => {
    if (user) {
      req.user = UserProfile({
        userId: user.user_id ? String(user.user_id) : null,
        birthday: user.user_birthday,
        cityName: user.user_city,
        cpf: user.user_cpf,
        district: user.user_district,
        email: user.profile_email,
        name: user.user_name,
        profileId: user.profile_id ? String(user.profile_id) : null,
        state: user.user_state,
        uf: user.user_uf,
        voteCardId: user.user_voteidcard,
        zipCode: user.user_zipcode,
      });

      if (includeLegacy) {
        const user = await userRepository.findById(req.user.userId, { legacy: true })
          .catch(e => {
            res.sendStatus(401);

            next(e);
          });

        if (user) {
          req.legacyUser = user;
          next(err);
        }

        return;
      }
    }

    next(err);
  })(req, res, next);
