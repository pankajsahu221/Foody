const express = require("express");
const route = express.Router();
const Menu = require("../app/models/menu.model.js");
const { updateCart } = require("../app/controllers/cart.controller.js");
const {
  registerUser,
  loginUser,
  logoutUser
} = require("../app/controllers/auth.controller.js");
const guest = require("../app/middlewares/guest.js");

route.get("/", async (req, res) => {
  try {
    const foods = await Menu.find().lean();

    res.render("home", {
      foods: foods
    });
  } catch (e) {
    console.log(e);
  }
});

route.get("/cart", (req, res) => {
  res.render("customers/cart");
});

route.get("/login", guest, (req, res) => {
  res.render("auth/login");
});

route.get("/register", guest, (req, res) => {
  res.render("auth/register");
});

////////// API  /////////

// add item to cart
route.post("/update-cart", updateCart);

// register user
route.post("/register", guest, registerUser);

// login user
route.post("/login", guest, loginUser);

// logout user
route.post("/logout", logoutUser);

module.exports = route;
