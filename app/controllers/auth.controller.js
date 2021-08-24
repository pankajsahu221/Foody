const User = require("../models/user.model.js");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash("error", "All fields are required");

      //   sending name and email to stay at the input field to avoid loosing when refresh.
      req.flash("name", name);
      req.flash("email", email);
      return res.redirect("/register");
    }

    // check if the user already exists
    await User.findOne({ email: email }, (err, foundUser) => {
      if (foundUser) {
        req.flash("error", "Email already registered");
        req.flash("name", name);
        req.flash("email", email);

        return res.redirect("/register");
      }
    });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      name: name,
      email: email,
      password: hashedPassword
    };

    // saving user data to the db
    await User.create(newUser, (err, data) => {
      if (data) {
        return res.redirect("/");
      } else {
        console.log(err);
        req.flash("error", "Something went wrong");
        return res.redirect("/register");
      }
    });

    // create user
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
};

exports.loginUser = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "All fields are required");

      return res.redirect("/login");
    }

    passport.authenticate("local", (err, user, info) => {
      // if there is any error
      if (err) {
        req.flash("error", info.message);
        return next(err);
      }

      if (!user) {
        req.flash("error", info.message);
        return res.redirect("/login");
      }

      req.logIn(user, error => {
        if (error) {
          req.flash("error", info.message);
          return next(err);
        }
        return res.redirect("/");
      });
    })(req, res, next);
  } catch (e) {
    console.log(e);
    res.redirect("/login");
  }
};

exports.logoutUser = (req, res) => {
  req.logout();
  return res.redirect("/login");
};
