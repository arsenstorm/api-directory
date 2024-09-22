import { createClient } from "npm:@supabase/supabase-js@^2.45.4";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import type { Stripe as StripeTypes } from "https://esm.sh/v135/stripe@16.12.0/types/index.d.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") as string,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string,
  );
  const signature = request.headers.get("Stripe-Signature");

  const body = await request.text();
  let receivedEvent: StripeTypes.Event;

  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET"),
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
  console.log(`🔔 Event received: ${receivedEvent.id}`);

  switch (receivedEvent.type) {
    case "checkout.session.completed": {
      const { metadata } = receivedEvent.data
        .object as StripeTypes.Checkout.Session;

      const { user_id, amount } = metadata;

      const { data, error } = await supabase.from("users").select("funds").eq(
        "id",
        user_id,
      ).single();

      if (error) {
        console.log("❌ Error getting user funds");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      const { funds } = data;

      const newFunds = funds + amount;

      const { error: updateError } = await supabase.from("users").update({
        funds: newFunds,
      }).eq("id", user_id);

      if (updateError) {
        console.log("❌ Error updating user funds");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      console.log("✅ User funds updated");
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    case "checkout.session.expired": {
      console.log("❌ Checkout session expired");
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    case "charge.failed": {
      console.log("❌ Charge failed");
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    default:
      console.log("⚠️ Unhandled event type", receivedEvent.type);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
});
