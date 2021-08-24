import axios from "axios";
import Noty from "noty";

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");

function updateCart(food) {
  axios
    .post("/update-cart", food)
    .then(res => {
      //   console.log(res);
      cartCounter.innerText = res.data.totalQty;

      //   to show a popup
      new Noty({
        text: "Item added to cart",
        type: "success",
        timeout: 1000,
        progressBar: false
      }).show();
    })
    .catch(e => {
      console.log(e);
      //   to show a popup
      new Noty({
        text: "Something went wrong",
        type: "error",
        timeout: 1000,
        progressBar: false
      }).show();
    });
}

addToCart.forEach(btn => {
  btn.addEventListener("click", e => {
    let food = JSON.parse(btn.dataset.food);

    updateCart(food); //add the food to the cart
  });
});

//Remove alert message after x seconds
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}
