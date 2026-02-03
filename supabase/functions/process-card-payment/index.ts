import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip",
};

// Rate limiting constants
const MAX_ATTEMPTS_PER_IP = 5;          // Max attempts per IP in time window
const MAX_ATTEMPTS_PER_EMAIL = 5;       // Max attempts per email in time window
const MAX_ATTEMPTS_PER_CARD = 2;        // Max attempts per card (last 4 digits) in time window
const MAX_DIFFERENT_CARDS_PER_IP = 3;   // Max different cards per IP (fraud detection)
const MAX_DIFFERENT_CARDS_PER_EMAIL = 3; // Max different cards per email (fraud detection)
const TIME_WINDOW_MINUTES = 10;         // Time window in minutes

// Price mapping for each package - Método de Mejores Prácticas (amount in cents)
const PRICES: Record<string, { amount: number; description: string }> = {
  "1": { amount: 100, description: "Método de Mejores Prácticas - Test" },      // $1.00
  "9": { amount: 900, description: "Método de Mejores Prácticas" },      // $9.00
  "15": { amount: 1590, description: "Método de Mejores Prácticas Plus" },   // $15.90
  "19": { amount: 1900, description: "Método de Mejores Prácticas Pro" },   // $19.00
};

// Create Supabase client with service role for database access
function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
}

// Get client IP from headers
function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return "unknown";
}

// Check rate limits and record attempt
async function checkRateLimits(
  supabase: ReturnType<typeof getSupabaseClient>,
  ip: string,
  email: string,
  cardLast4?: string
): Promise<{ allowed: boolean; reason?: string }> {
  const timeWindowStart = new Date(Date.now() - TIME_WINDOW_MINUTES * 60 * 1000).toISOString();
  
  try {
    // Check IP attempts
    const { count: ipCount, error: ipError } = await supabase
      .from("payment_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", timeWindowStart);

    if (ipError) {
      console.error("[RATE-LIMIT] Error checking IP attempts:", ipError);
    } else if (ipCount && ipCount >= MAX_ATTEMPTS_PER_IP) {
      console.log(`[RATE-LIMIT] IP ${ip} blocked - ${ipCount} attempts in ${TIME_WINDOW_MINUTES} minutes`);
      return { 
        allowed: false, 
        reason: `Pagamento temporariamente indisponível. Tente novamente mais tarde.` 
      };
    }

    // Check different cards per IP (fraud detection)
    const { data: ipCards, error: ipCardsError } = await supabase
      .from("payment_attempts")
      .select("card_last4")
      .eq("ip_address", ip)
      .not("card_last4", "is", null)
      .gte("created_at", timeWindowStart);

    if (ipCardsError) {
      console.error("[RATE-LIMIT] Error checking IP cards:", ipCardsError);
    } else if (ipCards) {
      const uniqueCards = new Set(ipCards.map(r => r.card_last4).filter(Boolean));
      // If this would be a new card and already at limit
      if (cardLast4 && !uniqueCards.has(cardLast4) && uniqueCards.size >= MAX_DIFFERENT_CARDS_PER_IP) {
        console.log(`[RATE-LIMIT] IP ${ip} blocked - ${uniqueCards.size} different cards tried`);
        return { 
          allowed: false, 
          reason: `Pagamento temporariamente indisponível. Tente novamente mais tarde.` 
        };
      }
    }

    // Check email attempts
    if (email) {
      const { count: emailCount, error: emailError } = await supabase
        .from("payment_attempts")
        .select("*", { count: "exact", head: true })
        .eq("email", email.toLowerCase())
        .gte("created_at", timeWindowStart);

      if (emailError) {
        console.error("[RATE-LIMIT] Error checking email attempts:", emailError);
      } else if (emailCount && emailCount >= MAX_ATTEMPTS_PER_EMAIL) {
        console.log(`[RATE-LIMIT] Email ${email} blocked - ${emailCount} attempts in ${TIME_WINDOW_MINUTES} minutes`);
        return { 
          allowed: false, 
          reason: `Pagamento temporariamente indisponível. Tente novamente mais tarde.` 
        };
      }

      // Check different cards per email (fraud detection)
      const { data: emailCards, error: emailCardsError } = await supabase
        .from("payment_attempts")
        .select("card_last4")
        .eq("email", email.toLowerCase())
        .not("card_last4", "is", null)
        .gte("created_at", timeWindowStart);

      if (emailCardsError) {
        console.error("[RATE-LIMIT] Error checking email cards:", emailCardsError);
      } else if (emailCards) {
        const uniqueCards = new Set(emailCards.map(r => r.card_last4).filter(Boolean));
        // If this would be a new card and already at limit
        if (cardLast4 && !uniqueCards.has(cardLast4) && uniqueCards.size >= MAX_DIFFERENT_CARDS_PER_EMAIL) {
          console.log(`[RATE-LIMIT] Email ${email} blocked - ${uniqueCards.size} different cards tried`);
          return { 
            allowed: false, 
            reason: `Pagamento temporariamente indisponível. Tente novamente mais tarde.` 
          };
        }
      }
    }

    // Check card attempts (if card info provided)
    if (cardLast4) {
      const { count: cardCount, error: cardError } = await supabase
        .from("payment_attempts")
        .select("*", { count: "exact", head: true })
        .eq("card_last4", cardLast4)
        .gte("created_at", timeWindowStart);

      if (cardError) {
        console.error("[RATE-LIMIT] Error checking card attempts:", cardError);
      } else if (cardCount && cardCount >= MAX_ATTEMPTS_PER_CARD) {
        console.log(`[RATE-LIMIT] Card ****${cardLast4} blocked - ${cardCount} attempts in ${TIME_WINDOW_MINUTES} minutes`);
        return { 
          allowed: false, 
          reason: `Pagamento temporariamente indisponível. Tente novamente mais tarde.` 
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("[RATE-LIMIT] Error checking rate limits:", error);
    // On error, allow the attempt (fail open) but log it
    return { allowed: true };
  }
}

// Record a payment attempt
async function recordPaymentAttempt(
  supabase: ReturnType<typeof getSupabaseClient>,
  ip: string,
  email: string,
  cardLast4?: string,
  attemptType: string = "payment"
): Promise<void> {
  try {
    const { error } = await supabase.from("payment_attempts").insert({
      ip_address: ip,
      email: email?.toLowerCase() || null,
      card_last4: cardLast4 || null,
      attempt_type: attemptType,
    });

    if (error) {
      console.error("[RATE-LIMIT] Error recording attempt:", error);
    } else {
      console.log(`[RATE-LIMIT] Recorded ${attemptType} attempt for IP: ${ip}, email: ${email}, card: ****${cardLast4 || "N/A"}`);
    }
  } catch (error) {
    console.error("[RATE-LIMIT] Error recording attempt:", error);
  }
}

// Function to register sale with UTMify
async function registerUtmifySale(data: {
  orderId: string;
  email: string;
  name: string;
  value: number;
  productName: string;
  trackingParams?: any;
}) {
  const apiToken = Deno.env.get("UTMIFY_API_TOKEN");
  if (!apiToken) {
    console.log("[UTMIFY] No API token configured, skipping registration");
    return;
  }

  try {
    console.log("[UTMIFY] Registering sale", { orderId: data.orderId, value: data.value });

    // Format date as YYYY-MM-DD HH:MM:SS (UTC)
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

    const utmifyPayload = {
      orderId: data.orderId,
      platform: "Stripe",
      paymentMethod: "credit_card",
      status: "paid",
      createdAt: formattedDate,
      approvedDate: formattedDate,
      refundedAt: null,
      customer: {
        name: data.name || "Cliente",
        email: data.email || "",
        phone: null,
        document: null,
        country: "US",
      },
      products: [
        {
          id: data.orderId,
          name: "Produto 01",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: Math.round(data.value * 100),
        },
      ],
      trackingParameters: {
        src: data.trackingParams?.src || null,
        sck: data.trackingParams?.sck || null,
        utm_source: data.trackingParams?.utm_source || null,
        utm_medium: data.trackingParams?.utm_medium || null,
        utm_campaign: data.trackingParams?.utm_campaign || null,
        utm_content: data.trackingParams?.utm_content || null,
        utm_term: data.trackingParams?.utm_term || null,
      },
      commission: {
        totalPriceInCents: Math.round(data.value * 100),
        gatewayFeeInCents: 0,
        userCommissionInCents: Math.round(data.value * 100),
        currency: "USD",
      },
      isTest: false,
    };

    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": apiToken,
      },
      body: JSON.stringify(utmifyPayload),
    });

    const responseText = await response.text();
    console.log("[UTMIFY] API response", { status: response.status, response: responseText });
  } catch (error) {
    console.error("[UTMIFY] Error registering sale:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseClient();
  const clientIP = getClientIP(req);

  try {
    const { paymentMethodId, priceKey, email, name, trackingParams, billingAddress } = await req.json();
    
    console.log("[PROCESS-CARD-PAYMENT] Request received", { 
      paymentMethodId, 
      priceKey, 
      email, 
      name, 
      clientIP,
      trackingParams,
      billingAddress
    });

    if (!paymentMethodId) {
      throw new Error("PaymentMethod ID is required");
    }

    const priceData = PRICES[priceKey];
    if (!priceData) {
      throw new Error(`Invalid price key: ${priceKey}`);
    }

    // Initialize Stripe to get card info
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get card last 4 digits from PaymentMethod and check existing billing details
    let cardLast4: string | undefined;
    let existingBillingDetails: any = null;
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      cardLast4 = paymentMethod.card?.last4;
      existingBillingDetails = paymentMethod.billing_details;
      console.log("[PROCESS-CARD-PAYMENT] Card last 4:", cardLast4);
      console.log("[PROCESS-CARD-PAYMENT] PaymentMethod billing_details:", JSON.stringify(existingBillingDetails));
    } catch (e) {
      console.log("[PROCESS-CARD-PAYMENT] Could not retrieve card info:", e);
    }

    // If billingAddress was provided from frontend but PaymentMethod doesn't have it,
    // update the PaymentMethod with billing details for AVS verification
    if (billingAddress && (billingAddress.line1 || billingAddress.postal_code)) {
      try {
        console.log("[PROCESS-CARD-PAYMENT] Updating PaymentMethod with billing address:", JSON.stringify(billingAddress));
        await stripe.paymentMethods.update(paymentMethodId, {
          billing_details: {
            name: name || existingBillingDetails?.name || 'Customer',
            email: email || existingBillingDetails?.email || undefined,
            address: {
              line1: billingAddress.line1 || existingBillingDetails?.address?.line1 || undefined,
              line2: billingAddress.line2 || existingBillingDetails?.address?.line2 || undefined,
              city: billingAddress.city || existingBillingDetails?.address?.city || undefined,
              state: billingAddress.state || existingBillingDetails?.address?.state || undefined,
              postal_code: billingAddress.postal_code || existingBillingDetails?.address?.postal_code || undefined,
              country: billingAddress.country || existingBillingDetails?.address?.country || 'US',
            }
          }
        });
        console.log("[PROCESS-CARD-PAYMENT] PaymentMethod updated with billing details");
      } catch (e) {
        console.log("[PROCESS-CARD-PAYMENT] Could not update PaymentMethod billing details:", e);
      }
    }

    // Check rate limits BEFORE processing payment
    const rateLimitCheck = await checkRateLimits(supabase, clientIP, email, cardLast4);
    if (!rateLimitCheck.allowed) {
      console.log("[PROCESS-CARD-PAYMENT] Rate limited:", rateLimitCheck.reason);
      
      // Record blocked attempt
      await recordPaymentAttempt(supabase, clientIP, email, cardLast4, "blocked");
      
      return new Response(JSON.stringify({ 
        error: rateLimitCheck.reason,
        rate_limited: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Record this payment attempt
    await recordPaymentAttempt(supabase, clientIP, email, cardLast4, "payment");

    console.log("[PROCESS-CARD-PAYMENT] Creating and confirming PaymentIntent for amount:", priceData.amount);

    // Build billing address for AVS verification - use data from wallet or passed billing address
    const effectiveBillingAddress = {
      line1: billingAddress?.line1 || existingBillingDetails?.address?.line1 || undefined,
      line2: billingAddress?.line2 || existingBillingDetails?.address?.line2 || undefined,
      city: billingAddress?.city || existingBillingDetails?.address?.city || undefined,
      state: billingAddress?.state || existingBillingDetails?.address?.state || undefined,
      postal_code: billingAddress?.postal_code || existingBillingDetails?.address?.postal_code || undefined,
      country: billingAddress?.country || existingBillingDetails?.address?.country || 'US',
    };

    console.log("[PROCESS-CARD-PAYMENT] Effective billing address for AVS:", JSON.stringify(effectiveBillingAddress));

    // Build shipping details if we have address data (helps with fraud detection)
    const hasAddressData = effectiveBillingAddress.line1 || effectiveBillingAddress.postal_code;
    const shippingDetails = hasAddressData ? {
      shipping: {
        name: name || existingBillingDetails?.name || 'Customer',
        address: effectiveBillingAddress
      }
    } : {};

    // Create PaymentIntent with the PaymentMethod and confirm immediately
    // Include metadata for Stripe Radar to reduce false positives
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceData.amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true, // Confirm immediately
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Don't allow redirects for this flow
      },
      ...shippingDetails,
      // Metadata helps Stripe Radar understand the transaction is legitimate
      metadata: {
        customer_name: name || '',
        customer_email: email || '',
        product: priceData.description,
        price_key: priceKey,
        client_ip: clientIP,
        product_type: 'digital_goods',
        product_name: priceData.description,
        source: 'checkout_form',
        billing_line1: effectiveBillingAddress.line1 || '',
        billing_city: effectiveBillingAddress.city || '',
        billing_postal_code: effectiveBillingAddress.postal_code || '',
        billing_country: effectiveBillingAddress.country || '',
      },
      // Description helps with Radar rules and customer statements
      description: priceData.description,
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

    // Payment succeeded - Register with UTMify
    if (paymentIntent.status === 'succeeded') {
      console.log("[PROCESS-CARD-PAYMENT] Payment succeeded:", paymentIntent.id);
      
      // Register sale with UTMify immediately
      await registerUtmifySale({
        orderId: paymentIntent.id,
        email: email || '',
        name: name || '',
        value: priceData.amount / 100, // Convert cents to dollars
        productName: priceData.description,
        trackingParams,
      });

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
