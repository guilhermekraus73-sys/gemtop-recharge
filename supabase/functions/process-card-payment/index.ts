import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price mapping for each package (amount in cents)
const PRICES: Record<string, { amount: number; diamonds: number }> = {
  "9": { amount: 900, diamonds: 5600 },      // $9.00
  "15": { amount: 1590, diamonds: 11200 },   // $15.90
  "19": { amount: 1900, diamonds: 22400 },   // $19.00
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentMethodId, priceKey, email, name } = await req.json();
    
    console.log("[PROCESS-CARD-PAYMENT] Request received", { paymentMethodId, priceKey, email, name });

    if (!paymentMethodId) {
      throw new Error("PaymentMethod ID is required");
    }

    const priceData = PRICES[priceKey];
    if (!priceData) {
      throw new Error(`Invalid price key: ${priceKey}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    console.log("[PROCESS-CARD-PAYMENT] Creating and confirming PaymentIntent for amount:", priceData.amount);

    // Create PaymentIntent with the PaymentMethod and confirm immediately
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceData.amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true, // Confirm immediately
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Don't allow redirects for this flow
      },
      metadata: {
        customer_name: name || '',
        customer_email: email || '',
        diamonds: priceData.diamonds.toString(),
        price_key: priceKey,
      },
      receipt_email: email || undefined,
      return_url: `${req.headers.get("origin") || 'https://recargadediamantesoficial.online'}/obrigado`,
    });

    console.log("[PROCESS-CARD-PAYMENT] PaymentIntent status:", paymentIntent.status);

    // Check if additional authentication is required (3D Secure)
    if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
      console.log("[PROCESS-CARD-PAYMENT] Requires authentication");
      return new Response(JSON.stringify({ 
        requires_action: true,
        client_secret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Payment succeeded
    if (paymentIntent.status === 'succeeded') {
      console.log("[PROCESS-CARD-PAYMENT] Payment succeeded:", paymentIntent.id);
      return new Response(JSON.stringify({ 
        success: true,
        paymentIntentId: paymentIntent.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Other status (failed, etc.)
    console.log("[PROCESS-CARD-PAYMENT] Payment failed with status:", paymentIntent.status);
    return new Response(JSON.stringify({ 
      error: `Payment failed with status: ${paymentIntent.status}`,
      paymentIntentId: paymentIntent.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PROCESS-CARD-PAYMENT] Error:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
