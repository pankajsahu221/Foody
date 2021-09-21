const Order = require("../../models/order.model.js");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

exports.addOrder = async (req, res) => {
  try {
    // console.log(req.body);
    const { phone, address, stripeToken, paymentType } = req.body;

    if (!phone || !address) {
      req.flash("error", "All fields are required");
      return res.status(422).json({ message: "All fields are required" });
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
        return res.status(500).json({ message: "Something went wrong" });
      } else {
        Order.populate(data, { path: "customerId" }, (err, populatedData) => {
          if (populatedData) {
            // req.flash("success", "Order placed succesfully");

            //if payment type was card
            if (paymentType == "card") {
              stripe.charges
                .create({
                  amount: req.session.cart.totalPrice * 100,
                  source: stripeToken,
                  currency: "inr",
                  description: `Food order: ${populatedData._id}`
                })
                .then(() => {
                  populatedData.paymentStatus = true;
                  populatedData.paymentType = "card";
                  populatedData.save();
                  // Emit
                  const eventEmitter = req.app.get("eventEmitter");
                  eventEmitter.emit("orderPlaced", populatedData);
                  delete req.session.cart;
                  return res.status(200).json({
                    message: "Payment successful, Order placed successfully"
                  });
                })
                .catch(err => {
                  delete req.session.cart;
                  return res.json({
                    message:
                      "Order placed but payment failed, You can pay at delivery time"
                  });
                });
            }
            // if payment type is cod
            else {
              // Emit event
              const eventEmitter = req.app.get("eventEmitter");
              eventEmitter.emit("orderPlaced", populatedData);
              delete req.session.cart; //remove items from cart after placing the order

              return res
                .status(200)
                .json({ message: "Order placed succesfully" });
            }
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
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

exports.orderFilter = async (req, res) => {
  const filterType = req.body.filterType;

  let timeSpan = new Date();

  if (filterType == "last24hours") {
    timeSpan = 60 * 60 * 24 * 1000;
  } else if (filterType == "last7days") {
    timeSpan = 7 * 60 * 60 * 24 * 1000;
  } else if (filterType == "last1month") {
    timeSpan = 30 * 60 * 60 * 24 * 1000;
  }

  const orders = await Order.find({
    customerId: req.user._id,
    createdAt: {
      $gte: new Date(new Date() - timeSpan)
    }
  }).lean();

  res.json(orders);
};
