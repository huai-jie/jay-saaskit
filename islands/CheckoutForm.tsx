// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { useEffect, useState } from "preact/hooks";

export default function CheckoutForm() {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {

    const setupPrice = async () => {
      const stripe = new Stripe(STRIPE_SECRET_KEY!, {
        apiVersion: "2023-10-16",
        // Use the Fetch API instead of Node's HTTP client.
        httpClient: Stripe.createFetchHttpClient(),
      });
      const res = await stripe.paymentIntents.create({
        amount: 1400,
        currency: "myr",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
      console.log(res);
    };
    setupPrice();
    // const stripe = Stripe(
    //   "pk_test_51MXHRGFuWaVfNZQZYlGjTh0GXMLTDHrxeH2CFZDaGZctvRbPYviZF015QXZoDlJRGr44tlpD2tDWkMpcaeEG12B200sjCZDA2g",
    // );
    // const appearance = {
    //   theme: "stripe",
    // };
    // elements = stripe.elements({ appearance, clientSecret });
    // const paymentElementOptions = {
    //   layout: "tabs",
    // };

    // const paymentElement = elements.create("payment", paymentElementOptions);
    // paymentElement.mount("#payment-element");
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
