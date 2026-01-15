import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    console.error("No stripe-signature header");
    return new Response(JSON.stringify({ error: "No signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Webhook event received: ${event.type}`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return new Response(JSON.stringify({ error: `Webhook Error: ${errorMessage}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Handle specific events
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}, amount: ${paymentIntent.amount}`);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent failed: ${failedPayment.id}, error: ${failedPayment.last_payment_error?.message}`);
      break;

    case "charge.refunded":
      const refund = event.data.object as Stripe.Charge;
      console.log(`Charge refunded: ${refund.id}, amount refunded: ${refund.amount_refunded}`);
      break;

    case "charge.dispute.created":
      const dispute = event.data.object;
      console.log(`Dispute created: ${dispute.id}`);
      break;

    case "charge.dispute.closed":
      const closedDispute = event.data.object;
      console.log(`Dispute closed: ${closedDispute.id}`);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
