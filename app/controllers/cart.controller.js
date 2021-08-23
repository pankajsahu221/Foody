exports.updateCart = (req, res) => {
  try {
    // if there is no cart , then create a cart
    if (!req.session.cart) {
      req.session.cart = {
        items: {},
        totalQty: 0,
        totalPrice: 0
      };
    }

    let food = {
      _id: req.body._id,
      name: req.body.name,
      image: req.body.image,
      price: req.body.price,
      size: req.body.size
    };

    let cart = req.session.cart;

    // session cart structure
    //  let cart = {
    //       items: {
    //          foodid: { item: food, qty: 0}
    //          foodid: { item: food, qty: 0}
    //          foodid: { item: food, qty: 0}
    //       }
    //       totalqty
    //       totalprice
    //   }

    //   if the food does not exist in cart, then we will add it otherwise we would only incease the quantity of that food
    if (!cart.items[food._id]) {
      cart.items[food._id] = {
        item: food,
        qty: 1
      };
      cart.totalQty = cart.totalQty + 1;
      cart.totalPrice = Number(cart.totalPrice) + Number(food.price);
    } else {
      cart.items[food._id].qty = cart.items[food._id].qty + 1;
      cart.totalQty = cart.totalQty + 1;
      cart.totalPrice = Number(cart.totalPrice) + Number(food.price);
    }

    //   console.log(req.body);
    return res.status(200).json({ totalQty: req.session.cart.totalQty });
  } catch (e) {
    console.log(e);
  }
};
