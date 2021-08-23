const express = require("express");
const route = express.Router();
const Menu = require("../app/models/menu.model.js");
const { updateCart } = require("../app/controllers/cart.controller.js");

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

route.get("/login", (req, res) => {
  res.render("auth/login");
});

route.get("/register", (req, res) => {
  res.render("auth/register");
});

////////// API  /////////

route.post("/update-cart", updateCart);

module.exports = route;
