// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { type Handlers } from "$fresh/server.ts";
import { STATUS_CODE } from "$std/http/status.ts";
import { isStripeEnabled, stripe } from "@/utils/stripe.ts";
import { BadRequestError } from "@/utils/http.ts";

export const handler: Handlers = {
  /**
   * Handles Stripe webhooks requests when a user subscribes
   * (`customer.subscription.created`) or cancels
   * (`customer.subscription.deleted`) the "Premium Plan".
   *
   * @see {@link https://github.com/stripe-samples/stripe-node-deno-samples/blob/2d571b20cd88f1c1f02185483729a37210484c68/webhook-signing/main.js}
   */
  async POST(req) {
    if (!isStripeEnabled()) throw new Deno.errors.NotFound("Not Found");

    /** @see {@link https://stripe.com/docs/webhooks#verify-events} */
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (signature === null) {
      throw new BadRequestError("`Stripe-Signature` header is missing");
    }
    const signingSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (signingSecret === undefined) {
      throw new Error(
        "`STRIPE_WEBHOOK_SECRET` environment variable is not set",
      );
    }

    // Todo: check the element type
    // let event: Stripe.Event;
    let event;
    const { items } = JSON.parse(body);

    try {
      event = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "eur",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (error) {
      throw new BadRequestError(error.message);
    }

    // console.log(event);
    return Response.json({
      clientSecret: event.client_secret,
    }, { status: STATUS_CODE.Accepted });
  },
};

const calculateOrderAmount = (_items: any) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};
