import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UTMifySaleRequest {
  orderId: string;
  email: string;
  name: string;
  value: number;
  currency: string;
  productName: string;
  leadId?: string;
  sourceUrl?: string;
  trackingParams?: {
    src?: string;
    sck?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get("UTMIFY_API_TOKEN");
    if (!apiToken) {
      throw new Error("UTMIFY_API_TOKEN is not configured");
    }

    const body: UTMifySaleRequest = await req.json();
    const { orderId, email, name, value, currency, productName, leadId, sourceUrl, trackingParams } = body;

    console.log("[REGISTER-UTMIFY-SALE] Request received", { orderId, email, value, productName, trackingParams });

    // Format date as YYYY-MM-DD HH:MM:SS (UTC) - required by UTMify
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

    // Build UTMify API payload according to official documentation
    const utmifyPayload = {
      orderId,
      platform: "Stripe",
      paymentMethod: "credit_card",
      status: "paid",
      createdAt: formattedDate,
      approvedDate: formattedDate,
      refundedAt: null,
      customer: {
        name: name || "Cliente",
        email: email || "",
        phone: null,
        document: null,
        country: "US",
      },
      products: [
        {
          id: orderId,
          name: "Produto 01",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: Math.round(value * 100),
        },
      ],
      trackingParameters: {
        src: trackingParams?.src || leadId || null,
        sck: trackingParams?.sck || null,
        utm_source: trackingParams?.utm_source || null,
        utm_medium: trackingParams?.utm_medium || null,
        utm_campaign: trackingParams?.utm_campaign || null,
        utm_content: trackingParams?.utm_content || null,
        utm_term: trackingParams?.utm_term || null,
      },
      commission: {
        totalPriceInCents: Math.round(value * 100),
        gatewayFeeInCents: 0,
        userCommissionInCents: Math.round(value * 100),
        currency: currency || "USD",
      },
      isTest: false,
    };

    console.log("[REGISTER-UTMIFY-SALE] Sending to UTMify API", { orderId, endpoint: "api-credentials/orders" });

    // Send to UTMify API - correct endpoint with x-api-token header
    const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": apiToken,
      },
      body: JSON.stringify(utmifyPayload),
    });

    const responseText = await utmifyResponse.text();
    console.log("[REGISTER-UTMIFY-SALE] UTMify API response", { 
      status: utmifyResponse.status, 
      response: responseText 
    });

    if (!utmifyResponse.ok) {
      console.error("[REGISTER-UTMIFY-SALE] UTMify API error", { 
        status: utmifyResponse.status, 
        response: responseText 
      });
      // Don't throw - we don't want to fail the user's payment flow
    }

    return new Response(JSON.stringify({ 
      success: utmifyResponse.ok,
      message: utmifyResponse.ok ? "Sale registered with UTMify" : "UTMify registration failed but payment succeeded"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[REGISTER-UTMIFY-SALE] Error:", errorMessage);
    
    // Return success anyway - we don't want UTMify issues to affect user experience
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      message: "UTMify registration failed but this doesn't affect your payment"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
