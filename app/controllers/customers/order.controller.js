const Order = require("../../models/order.model.js");

exports.addOrder = async (req, res) => {
  const { phone, address } = req.body;

  if (!phone || !address) {
    req.flash("error", "All fields are required");
    return res.redirect("/cart");
  }

  const newOrder = {
    customerId: req.user._id,
    items: req.session.cart.items,
    phone: phone,
    address: address
  };

  await Order.create(newOrder, (err, data) => {
    if (err) {
      req.flash("error", "Something went wrong");
      return res.redirect("/cart");
    } else {
      req.flash("success", "Order placed succesfully");
      delete req.session.cart; //remove items from cart after placing the order
      return res.redirect("/customer/orders");
    }
  });
};
