// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { useEffect } from "preact/hooks";
import { loadStripe, StripePaymentElement } from "@stripe/stripe-js";

export default function CheckoutForm(props: { clientSecret: string }) {
  useEffect(() => {
    let stripe;
    const setupStripe = async () => {
      stripe = await loadStripe(
        "pk_test_51MXHRGFuWaVfNZQZYlGjTh0GXMLTDHrxeH2CFZDaGZctvRbPYviZF015QXZoDlJRGr44tlpD2tDWkMpcaeEG12B200sjCZDA2g",
      );
      const appearance = {
        theme: "stripe",
      };
      if (stripe) {
        const elements = stripe.elements({
          ...appearance,
          clientSecret: props.clientSecret,
        });
        const paymentElementOptions = {
          paymentRequestButton: { // Only necessary if using the Payment Request Button
            type: "default", // Or 'book', 'buy', 'donate'
          },
          layout: "tabs",
        };
        const paymentElement: StripePaymentElement = elements.create(
          // @ts-ignore: Property 'payment' actually does exist on type 'StripePaymentElement'
          "payment",
          paymentElementOptions,
        );
        paymentElement.mount("#payment-element");
      }
    };
    setupStripe();
  }, []);

  return (
    <>
      <form id="payment-form">
        <div id="payment-element">
        </div>
        <button id="submit">
          <div class="spinner hidden" id="spinner"></div>
          <span id="button-text">Pay now</span>
        </button>
        <div id="payment-message" class="hidden"></div>
      </form>
    </>
  );
}
