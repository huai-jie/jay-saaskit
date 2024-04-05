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

  if (data.length === 0) {
    throw new Error(
      "No Stripe products have been found. Please see https://github.com/denoland/saaskit#set-up-stripe-optional to set up Stripe locally and create a Stripe product.",
    );
  }

  return (
    <>
      <Head title="Pricing" href={ctx.url.href}>
        <script src="https://js.stripe.com/v3/"></script>
      </Head>
      <main class="mx-auto max-w-5xl w-full flex-1 flex flex-col justify-center px-4">
        <CheckoutForm />
      </main>
    </>
  );
});
