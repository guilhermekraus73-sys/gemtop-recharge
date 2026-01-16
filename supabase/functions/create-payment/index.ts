import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price mapping for each package - Método de Mejores Prácticas
const PRICES: Record<string, string> = {
  "9": "price_1SqCc6DSZSnaeaRa1lN1Zk0U",    // $9.00 - Método de Mejores Prácticas
  "15": "price_1SqCcGDSZSnaeaRaaPSXLLok",   // $15.90 - Método de Mejores Prácticas Plus
  "19": "price_1SqCcRDSZSnaeaRaVBU38GeB",   // $19.00 - Método de Mejores Prácticas Pro
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceKey, email, name } = await req.json();
    
    console.log("[CREATE-PAYMENT] Request received", { priceKey, email, name });

    const priceId = PRICES[priceKey];
    if (!priceId) {
      throw new Error(`Invalid price key: ${priceKey}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    console.log("[CREATE-PAYMENT] Creating checkout session for price:", priceId);

    // Create a guest checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/obrigado`,
      cancel_url: `${req.headers.get("origin")}/checkout${priceKey}`,
      metadata: {
        customer_name: name || '',
        customer_email: email || '',
      },
    });

    console.log("[CREATE-PAYMENT] Session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-PAYMENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
