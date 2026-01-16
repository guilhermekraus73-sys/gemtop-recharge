import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price mapping for each package - Bono de Diamantes Free Fire
const PRICES: Record<string, string> = {
  "9": "price_1Sq0fJJuI6JxdCYqrkkTcDs0",    // $9.00 - 5600 diamonds
  "15": "price_1Sq0fVJuI6JxdCYq3Z1PVkX9",   // $15.90 - 11200 diamonds
  "19": "price_1Sq0flJuI6JxdCYqRzV7PaBm",   // $19.00 - 22400 diamonds
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
