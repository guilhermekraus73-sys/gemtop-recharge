import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Country coordinates for map pins
const countryCoordinates: Record<string, { lat: number; lng: number }> = {
  US: { lat: 37.0902, lng: -95.7129 },
  MX: { lat: 23.6345, lng: -102.5528 },
  GT: { lat: 15.7835, lng: -90.2308 },
  CA: { lat: 56.1304, lng: -106.3468 },
  CO: { lat: 4.5709, lng: -74.2973 },
  PE: { lat: -9.19, lng: -75.0152 },
  EC: { lat: -1.8312, lng: -78.1834 },
  DO: { lat: 18.7357, lng: -70.1627 },
  CL: { lat: -35.6751, lng: -71.543 },
  BR: { lat: -14.235, lng: -51.9253 },
  AR: { lat: -38.4161, lng: -63.6167 },
  VE: { lat: 6.4238, lng: -66.5897 },
  PA: { lat: 8.538, lng: -80.7821 },
  CR: { lat: 9.7489, lng: -83.7534 },
  HN: { lat: 15.2, lng: -86.2419 },
  SV: { lat: 13.7942, lng: -88.8965 },
  NI: { lat: 12.8654, lng: -85.2072 },
  BO: { lat: -16.2902, lng: -63.5887 },
  PY: { lat: -23.4425, lng: -58.4438 },
  UY: { lat: -32.5228, lng: -55.7658 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

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
      
      try {
        // Extract metadata
        const metadata = paymentIntent.metadata || {};
        const countryCode = metadata.country_code || null;
        const coords = countryCode && countryCoordinates[countryCode] 
          ? countryCoordinates[countryCode] 
          : null;

        // Insert sale into database
        const { error: insertError } = await supabase.from("sales").insert({
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
          email: metadata.email || paymentIntent.receipt_email || null,
          customer_name: metadata.customer_name || null,
          amount_cents: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          product_name: metadata.product_name || "Diamond Recharge",
          country_code: countryCode,
          city: metadata.city || null,
          latitude: coords?.lat || null,
          longitude: coords?.lng || null,
          utm_source: metadata.utm_source || null,
          utm_medium: metadata.utm_medium || null,
          utm_campaign: metadata.utm_campaign || null,
          session_id: metadata.session_id || null,
          status: "succeeded",
        });

        if (insertError) {
          console.error("[STRIPE-WEBHOOK] Failed to insert sale:", insertError);
        } else {
          console.log(`[STRIPE-WEBHOOK] Sale recorded: ${paymentIntent.id}, $${paymentIntent.amount / 100}`);
        }
      } catch (dbError) {
        console.error("[STRIPE-WEBHOOK] Database error:", dbError);
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log(`[STRIPE-WEBHOOK] PaymentIntent failed: ${failedPayment.id}, error: ${failedPayment.last_payment_error?.message}`);
      break;

    case "charge.refunded":
      const refund = event.data.object as Stripe.Charge;
      console.log(`[STRIPE-WEBHOOK] Charge refunded: ${refund.id}, amount refunded: ${refund.amount_refunded}`);
      
      // Update sale status if exists
      if (refund.payment_intent) {
        const piId = typeof refund.payment_intent === 'string' ? refund.payment_intent : refund.payment_intent.id;
        await supabase
          .from("sales")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", piId);
      }
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
