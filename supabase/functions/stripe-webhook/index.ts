import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!webhookSecret) {
    console.error("[STRIPE-WEBHOOK] STRIPE_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    console.error("[STRIPE-WEBHOOK] No stripe-signature header");
    return new Response(JSON.stringify({ error: "No signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log(`[STRIPE-WEBHOOK] Event received: ${event.type}`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`[STRIPE-WEBHOOK] Signature verification failed: ${errorMessage}`);
    return new Response(JSON.stringify({ error: `Webhook Error: ${errorMessage}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Handle specific events
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`[STRIPE-WEBHOOK] PaymentIntent succeeded: ${paymentIntent.id}, amount: ${paymentIntent.amount}`);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log(`[STRIPE-WEBHOOK] PaymentIntent failed: ${failedPayment.id}, error: ${failedPayment.last_payment_error?.message}`);
      break;

    case "charge.refunded":
      const refund = event.data.object as Stripe.Charge;
      console.log(`[STRIPE-WEBHOOK] Charge refunded: ${refund.id}, amount refunded: ${refund.amount_refunded}`);
      break;

    case "charge.dispute.created":
      const dispute = event.data.object;
      console.log(`[STRIPE-WEBHOOK] Dispute created: ${dispute.id}`);
      break;

    case "charge.dispute.closed":
      const closedDispute = event.data.object;
      console.log(`[STRIPE-WEBHOOK] Dispute closed: ${closedDispute.id}`);
      break;

    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[STRIPE-WEBHOOK] Checkout session completed: ${session.id}, customer: ${session.customer_email}`);
      break;

    default:
      console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
