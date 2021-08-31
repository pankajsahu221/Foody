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
      Order.populate(data, { path: "customerId" }, (err, populatedData) => {
        if (populatedData) {
          req.flash("success", "Order placed succesfully");
          delete req.session.cart; //remove items from cart after placing the order

          // Emit event
          const eventEmitter = req.app.get("eventEmitter");
          eventEmitter.emit("orderPlaced", populatedData);

          return res.redirect("/customer/orders");
        }
      });
    }
  });
};

exports.cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  let foundAndVerified = false;

  // finding the order and then verifing the customer of order and the logged in user
  await Order.findOne({ _id: orderId }, async (err, foundOrder) => {
    if (
      foundOrder &&
      foundOrder.customerId.toString() === req.user._id.toString()
    ) {
      foundAndVerified = true;
    }
  });

  // if verified, then delete
  if (foundAndVerified) {
    await Order.deleteOne({ _id: orderId }, (err, data) => {
      if (data) {
        return res.redirect("/customer/orders");
      }
    });
  }
};
