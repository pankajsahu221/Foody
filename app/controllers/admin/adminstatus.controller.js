const Order = require("../../models/order.model.js");

// update the status of an order
exports.updateStatus = (req, res) => {
  const { orderId, status } = req.body;

  Order.findOne({ _id: orderId }, (err, foundOrder) => {
    if (err) {
      console.log(err);
      return res.redirect("/admin/orders");
    } else {
      foundOrder.status = status;

      foundOrder.save();

      // Emit event
      const eventEmitter = req.app.get("eventEmitter");
      eventEmitter.emit("orderUpdated", { id: orderId, status: status });
      return res.redirect("/admin/orders");
    }
  });
};
