// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { type Handlers } from "$fresh/server.ts";
import { STATUS_CODE } from "$std/http/status.ts";
import { isStripeEnabled, stripe } from "@/utils/stripe.ts";
import { BadRequestError } from "@/utils/http.ts";

export const handler: Handlers = {
  async POST(req) {
    if (!isStripeEnabled()) throw new Deno.errors.NotFound("Not Found");
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
        currency: "myr",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (error) {
      throw new BadRequestError(error.message);
    }

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
