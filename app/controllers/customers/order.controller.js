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
