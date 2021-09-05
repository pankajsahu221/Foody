import axios from "axios";
import Noty from "noty";

export function placeOrder(formData) {
  axios
    .post("/orders/add", formData)
    .then(res => {
      console.log(res.data);
      new Noty({
        text: res.data.message,
        type: "success",
        timeout: 1000,
        progressBar: false
      }).show();

      setTimeout(() => {
        window.location.href = "/customer/orders";
      }, 1000);
    })
    .catch(e => {
      console.log(e);
      new Noty({
        text: e.res.data.message,
        type: "success",
        timeout: 1000,
        progressBar: false
      }).show();
    });
}
