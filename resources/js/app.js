import axios from "axios";
import Noty from "noty";
import { initAdmin } from "./admin";
import moment from "moment";

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

// to initialize admin file functionality
initAdmin();

// dynamically status update
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement("small");

function updateStatus(order) {
  statuses.forEach(status => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });

  let stepCompleted = true;

  statuses.forEach(status => {
    let dataProp = status.dataset.status;

    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;

      // set the time based on the order's last updated activity
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

// Socket
let socket = io();

// Join
if (order) {
  socket.emit("join", `order_${order._id}`);
}

//
let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  socket.emit("join", "adminRoom");
}

// it will update the status without even refreshing when there is emit from backend
socket.on("orderUpdated", data => {
  let updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;

  updateStatus(updatedOrder);
  //   to show a popup
  new Noty({
    text: `Order ${data.status}`,
    type: "success",
    timeout: 1000,
    progressBar: false
  }).show();
});

updateStatus(order);

function searchpagefunc() {
  const searchform = document.querySelector(".searchform");
  const searchresultdiv = document.querySelector(".searchresultdiv");
  let foodmarkup;

  //   fetch API to get data based no input value
  searchform.addEventListener("submit", e => {
    e.preventDefault();
    let inputvalue = e.target.searchinp.value;

    if (inputvalue != null) {
      fetch(`search/${inputvalue}`, {
        method: "POST"
      })
        .then(response => response.json())
        .then(data => {
          foodmarkup = generateFoodMarkup(data);
          searchresultdiv.innerHTML = foodmarkup;
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  //   to generate to markup for foods to store and show in frontend
  function generateFoodMarkup(foods) {
    return foods
      .map(food => {
        return `<div class="w-full md:w-64">
        <img class="h-40 mb-4 mx-auto" src="/img/${food.image}" alt="" />
        <div class="text-center">
          <h2 class="mb-4 text-lg">${food.name}</h2>
          <span class="size py-1 px-4 rounded-full uppercase text-xs"
            >${food.size}</span
          >
          <div class="flex items-center justify-around mt-6">
            <span class="font-bold text-lg">Rs.${food.price}</span>
            <button
              data-food="${JSON.stringify(food)}"
              class="add-to-cart py-1 px-6 rounded-full flex items-center font-bold"
            >
              <span>+</span>
              <span class="ml-4">Add</span>
            </button>
          </div>
        </div>
      </div>`;
      })
      .join("");
  }
}

searchpagefunc();
