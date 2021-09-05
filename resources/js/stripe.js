import axios from "axios";
import Noty from "noty";
import { placeOrder } from "./apiService";
import { loadStripe } from "@stripe/stripe-js";

export async function initStripe() {
  const stripe = await loadStripe(
    "pk_test_51HUVu5BlQOo2nKL9aKLnsYYd1jfpz1hxGKG73vrY0EWoHrGNYK5tayMJ3onQkoUMfHHZJiRIPRsf1HsIkrZZvHR4006QsMpEH7"
  );

  let card = null;

  function moundWidget() {
    const elements = stripe.elements();

    let style = {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    };

    card = elements.create("card", { style: style, hidePostalCode: true });
    card.mount("#card-element");
  }
  const paymentType = document.querySelector("#paymentType");

  if (paymentType) {
    paymentType.addEventListener("change", e => {
      if (e.target.value === "card") {
        moundWidget();
      } else {
        card.destroy();
      }
    });
  }

  // AJAX call
  const paymentForm = document.querySelector("#payment-form");

  if (paymentForm) {
    paymentForm.addEventListener("submit", e => {
      e.preventDefault();

      let formData = {
        phone: e.target.phone.value,
        address: e.target.address.value,
        paymentType: e.target.paymentType.value
      };

      //   if COD option is selected then simply place the order
      if (!card) {
        placeOrder(formData);
        return;
      }
      // else follow the card strategy
      else {
        // Verify card
        stripe
          .createToken(card)
          .then(result => {
            formData.stripeToken = result.token.id;
            placeOrder(formData);
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  }
}
