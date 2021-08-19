const express = require("express");
const route = express.Router();

route.get("/", (req, res) => {
  res.render("home");
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

module.exports = route;
