import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price mapping for each package - Método de Mejores Prácticas (amount in cents)
const PRICES: Record<string, { amount: number; diamonds: number; priceId: string }> = {
  "9": { amount: 900, diamonds: 5600, priceId: "price_1SqCc6DSZSnaeaRa1lN1Zk0U" },      // $9.00 - Método de Mejores Prácticas
  "15": { amount: 1590, diamonds: 11200, priceId: "price_1SqCcGDSZSnaeaRaaPSXLLok" },   // $15.90 - Método de Mejores Prácticas Plus
  "19": { amount: 1900, diamonds: 22400, priceId: "price_1SqCcRDSZSnaeaRaVBU38GeB" },   // $19.00 - Método de Mejores Prácticas Pro
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceKey, email, name } = await req.json();
    
    console.log("[CREATE-PAYMENT-INTENT] Request received", { priceKey, email, name });

    const priceData = PRICES[priceKey];
    if (!priceData) {
      throw new Error(`Invalid price key: ${priceKey}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    console.log("[CREATE-PAYMENT-INTENT] Creating payment intent for amount:", priceData.amount);

    // Create a PaymentIntent with specific payment methods (no Link)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceData.amount,
      currency: "usd",
      payment_method_types: ['card'],
      metadata: {
        customer_name: name || '',
        customer_email: email || '',
        diamonds: priceData.diamonds.toString(),
        price_key: priceKey,
      },
      receipt_email: email || undefined,
    });

    console.log("[CREATE-PAYMENT-INTENT] PaymentIntent created:", paymentIntent.id);

    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-PAYMENT-INTENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
