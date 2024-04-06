// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { State } from "@/plugins/session.ts";
import { assertIsPrice, isStripeEnabled, stripe } from "@/utils/stripe.ts";
import { formatCurrency } from "@/utils/display.ts";
import Stripe from "stripe";
import IconCheckCircle from "tabler_icons_tsx/circle-check.tsx";
import Head from "@/components/Head.tsx";
import CheckoutForm from "@/islands/CheckoutForm.tsx";
import { defineRoute } from "$fresh/server.ts";

const CARD_STYLES =
  "shadow-md flex flex-col flex-1 space-y-8 p-8 ring-1 ring-gray-300 ring-opacity-50 rounded-xl dark:bg-gray-700 bg-gradient-to-r";
const CHECK_STYLES = "size-6 text-primary shrink-0 inline-block mr-2";

export default defineRoute<State>(async (_req, ctx) => {
  if (!isStripeEnabled()) return await ctx.renderNotFound();

  const { data } = await stripe.products.list({
    expand: ["data.default_price"],
    active: true,
  });

  const retrieveClientSecret = async () => {
    // Create PaymentIntent as soon as the page loads
    const res = await fetch(ctx.url.origin + "/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": crypto.randomUUID(),
      },
      body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    });
    const data = await res.json();
    return (data.clientSecret);
  };
  const clientSecret = await retrieveClientSecret();

  if (data.length === 0) {
    throw new Error(
      "No Stripe products have been found. Please see https://github.com/denoland/saaskit#set-up-stripe-optional to set up Stripe locally and create a Stripe product.",
    );
  }

  return (
    <>
      <Head title="Pricing" href={ctx.url.href}>
        <link rel="stylesheet" href="/checkout.css" />
      </Head>
      <main class="mx-auto max-w-5xl w-full flex-1 flex flex-col justify-center px-4">
        <CheckoutForm clientSecret={clientSecret} />
      </main>
    </>
  );
});
