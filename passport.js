const LocalStrategy = require("passport-local").Strategy;
const User = require("./app/models/user.model.js");
const bcrypt = require("bcrypt");

const init = passport => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        // check if email exists
        await User.findOne({ email: email }, (err, user) => {
          if (!user) {
            return done(null, false, { message: "No user with this Email" });
          }

          bcrypt
            .compare(password, user.password)
            .then(match => {
              if (match) {
                return done(null, user, {
                  message: "Logged In succesfully"
                });
              }
              return done(null, false, {
                message: "Incorrect Email or password"
              });
            })
            .catch(e => {
              return done(null, false, { message: "Something went wrong" });
            });
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    User.findOne({ _id: id }, (err, user) => {
      done(err, user);
    });
  });
};

module.exports = init;
