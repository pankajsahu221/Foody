import axios from "axios";
import Noty from "noty";
import { initAdmin } from "./admin";
import { initStripe } from "./stripe";
import moment from "moment";

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");
let amountCounter = document.querySelector("#amountCounter");

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

// for order
initStripe();

// searchpage starts
function searchpagefunc() {
  const searchform = document.querySelector(".searchform");
  const searchresultdiv = document.querySelector(".searchresultdiv");
  let foodmarkup;

  if (searchform) {
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
            // console.log(data);

            while (searchresultdiv.firstChild) {
              searchresultdiv.removeChild(searchresultdiv.firstChild);
            }

            data.forEach(food => {
              // console.log(food);

              const child = document.createElement("div");

              child.innerHTML = `<div class="w-full md:w-64">
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
              searchresultdiv.appendChild(child);

              const cbtn = child.querySelector(".add-to-cart");
              cbtn.addEventListener("click", e => {
                let foodData = JSON.parse(cbtn.dataset.food);
                console.log(cbtn);
                // updateCart(foodData); //add the food to the cart
              });
            });

            // foodmarkup = generateFoodMarkup(data);
            // searchresultdiv.innerHTML = foodmarkup;
          })
          .catch(error => {
            console.error(error);
          });
      }
    });
  }

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
// searchpage ends

// REMOVE items from cart starts
function cartDeleteFunc() {
  const deleteBtns = document.querySelectorAll(".deletebtn");
  const pizzaList = document.querySelector(".pizza-list");

  deleteBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      let foodItem = JSON.parse(e.target.dataset.item);

      let foodhtmlitem = e.target.parentNode;

      axios
        .post("/remove-cart", foodItem)
        .then(res => {
          // console.log(res.data.cartItems);

          cartCounter.innerText = res.data.totalQty;
          amountCounter.innerText = res.data.totalPrice;

          // remove item's div element from the pizza-list div element
          pizzaList.removeChild(foodhtmlitem);

          // pizzaList.innerHTML = generateCartMarkup(
          //   Object.values(res.data.cartItems)
          // );

          //   to show a popup
          new Noty({
            text: "Item removed from cart",
            type: "success",
            timeout: 1000,
            progressBar: false
          }).show();

          if (res.data.totalQty == 0) {
            setTimeout(() => {
              window.location.href = "/cart";
            });
          }
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
    });
  });

  function generateCartMarkup(cartItems) {
    return cartItems
      .map(food => {
        return `
      <div class="cartitem flex items-center my-8">
        <img class="w-24" src="/img/${food.item.image}" alt="" />
        <div class="flex-1 ml-4">
          <h1>${food.item.name}</h1>
          <span>${food.item.size}</span>
        </div>
        <span class="flex-1">${food.qty} Pcs</span>
        <span class="font-bold text-lg"
          >Rs. ${Number(food.item.price) * Number(food.qty)}</span
        >

        <i
          class="deletebtn las la-times"
          data-item="${JSON.stringify(food.item)}"
        ></i>
      </div>`;
      })
      .join("");
  }
}
cartDeleteFunc();

// REMOVE items from cart ends

// FILTER Order functionality starts
function filterOrder() {
  const filterOrderSelect = document.querySelector(".filterOrderSelect");
  const customertablerow = document.querySelector(".customertablerow");
  const customertablebody = document.querySelector(".customertablebody");

  filterOrderSelect.addEventListener("change", e => {
    e.preventDefault();
    console.log(e.target.value);

    axios
      .post("/customer/order/filter", {
        filterType: e.target.value
      })
      .then(res => {
        console.log(res);

        const filteredOrders = res.data;

        // remove previous elements
        while (customertablebody.firstChild) {
          customertablebody.removeChild(customertablebody.firstChild);
        }

        filteredOrders.map(order => {
          const child = document.createElement("tr");
          child.classList.add("customertablerow");

          child.innerHTML = `<td class="border px-4 py-2">
          <a class="link" href="/customer/orders/${order._id}"
            >${order._id}</a
          >
        </td>
        <td class="border px-4 py-2">
          ${order.phone} 
        </td>
        <td class="border px-4 py-2">
        ${order.address}
        </td>
        <td class="border px-4 py-2">
          ${moment(order.createdAt).format("hh:mm A")}
        </td>
        <td class="border px-4 py-2">Not Paid</td>`;

          customertablebody.appendChild(child);
        });
      })
      .catch(e => {
        console.log(e);
      });
  });
}

filterOrder();

// FILTER Order functionality ends
