const express = require("express");
const route = express.Router();
const moment = require("moment");
const Menu = require("../app/models/menu.model.js");
const Order = require("../app/models/order.model.js");
const {
  updateCart
} = require("../app/controllers/customers/cart.controller.js");
const {
  registerUser,
  loginUser,
  logoutUser
} = require("../app/controllers/customers/auth.controller.js");
const {
  addOrder
} = require("../app/controllers/customers/order.controller.js");
const guest = require("../app/middlewares/guest.js");
const auth = require("../app/middlewares/auth.js");

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

route.get("/customer/orders", auth, async (req, res) => {
  try {
    const foundOrders = await Order.find({ customerId: req.user._id }, null, {
      sort: { createdAt: -1 }
    });

    if (foundOrders) {
      res.render("customers/orders", {
        orders: foundOrders,
        moment: moment
      });
    }
  } catch (e) {
    console.log(e);
    res.redirect("/");
  }
});

route.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "completed" } }, null, {
      sort: { createdAt: -1 }
    })
      .populate("customerId", "-password")
      .lean();

    res.render("admin/orders");
  } catch (e) {
    console.log(e);
    res.redirect("/");
  }
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

// place an order
route.post("/orders/add", auth, addOrder);

module.exports = route;
