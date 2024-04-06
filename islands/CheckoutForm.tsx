// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { useEffect, useState } from "preact/hooks";
import { loadStripe, StripePaymentElement } from "@stripe/stripe-js";

export default function CheckoutForm(props: { clientSecret: string }) {
  const [stripe, setStripe]: any = useState(undefined);
  const [elements, setElements]: any = useState(undefined);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:8000/checkout",
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      console.log(error.message);
    } else {
      console.log("An unexpected error occurred.");
    }
  }
  useEffect(() => {
    if (props.clientSecret) {
      const setupStripe = async () => {
        const s = await loadStripe(
          "pk_test_51MXHRGFuWaVfNZQZYlGjTh0GXMLTDHrxeH2CFZDaGZctvRbPYviZF015QXZoDlJRGr44tlpD2tDWkMpcaeEG12B200sjCZDA2g",
        );
        setStripe(s);
        const appearance = {
          theme: "stripe",
        };
        if (s) {
          const elements = s.elements({
            ...appearance,
            clientSecret: props.clientSecret,
          });
          setElements(elements);
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
    }
  }, [props.clientSecret]);

  return (
    <>
      <form id="payment-form">
        <div id="payment-element">
        </div>
        <button id="submit" onClick={(e) => handleSubmit(e)}>
          <div class="spinner hidden" id="spinner"></div>
          <span id="button-text">Pay now</span>
        </button>
        <div id="payment-message" class="hidden"></div>
      </form>
    </>
  );
}
