import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price mapping for each package (amount in cents USD)
const PRICES: Record<string, { amount: number; diamonds: number; description: string }> = {
  "1": { amount: 100, diamonds: 100, description: "100 Diamantes Free Fire" },           // $1.00 USD (test)
  "9": { amount: 900, diamonds: 5600, description: "5600 Diamantes Free Fire" },         // $9.00 USD
  "15": { amount: 1590, diamonds: 11200, description: "11200 Diamantes Free Fire" },     // $15.90 USD
  "19": { amount: 1900, diamonds: 22400, description: "22400 Diamantes Free Fire" },     // $19.00 USD
};

// Register sale with UTMify
const registerUtmifySale = async (
  email: string,
  name: string,
  amount: number,
  transactionId: string,
  trackingParams: Record<string, string>
) => {
  try {
    const utmifyApiToken = Deno.env.get("UTMIFY_API_TOKEN");
    if (!utmifyApiToken) {
      console.log("[PAYBEEHIVE] UTMify API token not configured, skipping registration");
      return;
    }

    console.log("[PAYBEEHIVE] Registering sale with UTMify...");
    
    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": utmifyApiToken,
      },
      body: JSON.stringify({
        orderId: transactionId,
        platform: "PayBeeHive",
        paymentMethod: "CreditCard",
        status: "paid",
        createdAt: new Date().toISOString(),
        approvedDate: new Date().toISOString(),
        customer: {
          name: name || "Cliente",
          email: email,
          phone: "",
          document: "",
          country: "BR",
        },
        products: [
          {
            id: "diamantes-freefire",
            name: "Diamantes Free Fire",
            planId: "",
            planName: "",
            quantity: 1,
            priceInCents: amount,
          },
        ],
        trackingParameters: {
          src: trackingParams?.src || "",
          sck: trackingParams?.sck || "",
          utm_source: trackingParams?.utm_source || "",
          utm_medium: trackingParams?.utm_medium || "",
          utm_campaign: trackingParams?.utm_campaign || "",
          utm_content: trackingParams?.utm_content || "",
          utm_term: trackingParams?.utm_term || "",
        },
        commission: {
          totalPriceInCents: amount,
          gatewayFeeInCents: 0,
          userCommissionInCents: amount,
        },
        isTest: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PAYBEEHIVE] UTMify registration failed:", errorText);
    } else {
      console.log("[PAYBEEHIVE] UTMify sale registered successfully");
    }
  } catch (error) {
    console.error("[PAYBEEHIVE] Error registering with UTMify:", error);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      priceKey, 
      email, 
      name, 
      cardNumber, 
      cardHolderName, 
      cardExpMonth, 
      cardExpYear, 
      cardCvv,
      trackingParams 
    } = await req.json();
    
    console.log("[PAYBEEHIVE] Request received", { priceKey, email, name });

    const priceData = PRICES[priceKey];
    if (!priceData) {
      throw new Error(`Invalid price key: ${priceKey}`);
    }

    // Initialize PayBeeHive
    const secretKey = Deno.env.get("PAYBEEHIVE_SECRET_KEY");
    if (!secretKey) {
      throw new Error("PAYBEEHIVE_SECRET_KEY not configured");
    }

    const authHeader = "Basic " + btoa(`${secretKey}:x`);

    console.log("[PAYBEEHIVE] Creating transaction for amount:", priceData.amount);

    // Parse expiration month and year as integers
    const expMonth = parseInt(cardExpMonth, 10);
    const expYear = parseInt(cardExpYear, 10);

    console.log("[PAYBEEHIVE] Parsed expiration:", { expMonth, expYear });

    // Create transaction with PayBeeHive (USD - PayBeeHive converts to BRL)
    const transactionPayload = {
      amount: priceData.amount,
      currency: "USD",
      paymentMethod: "credit_card",
      card: {
        number: cardNumber.replace(/\s/g, ""),
        holderName: cardHolderName,
        expirationMonth: expMonth,
        expirationYear: expYear,
        cvv: cardCvv,
      },
      installments: 1,
      customer: {
        name: name,
        email: email,
        document: {
          type: "cpf",
          number: "87329824020",
        },
      },
      items: [
        {
          externalRef: `diamonds-${priceKey}`,
          title: priceData.description,
          unitPrice: priceData.amount,
          quantity: 1,
          tangible: false,
        },
      ],
      metadata: JSON.stringify({
        price_key: priceKey,
        diamonds: priceData.diamonds,
      }),
    };

    console.log("[PAYBEEHIVE] Sending transaction to PayBeeHive API...");

    const response = await fetch("https://api.conta.paybeehive.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(transactionPayload),
    });

    const result = await response.json();
    
    console.log("[PAYBEEHIVE] API Response status:", response.status);
    console.log("[PAYBEEHIVE] Transaction result:", JSON.stringify(result));

    if (!response.ok) {
      const errorMessage = result.message || result.error || "Error al procesar el pago";
      console.error("[PAYBEEHIVE] Transaction failed:", errorMessage);
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: result 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check transaction status
    if (result.status === "paid" || result.status === "authorized") {
      console.log("[PAYBEEHIVE] Payment successful! Transaction ID:", result.id);
      
      // Register with UTMify
      await registerUtmifySale(
        email,
        name,
        priceData.amount,
        result.id?.toString() || `pb-${Date.now()}`,
        trackingParams || {}
      );

      return new Response(JSON.stringify({ 
        success: true,
        transactionId: result.id,
        status: result.status,
        diamonds: priceData.diamonds,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (result.status === "processing" || result.status === "pending") {
      console.log("[PAYBEEHIVE] Payment is processing...");
      return new Response(JSON.stringify({ 
        success: true,
        pending: true,
        transactionId: result.id,
        status: result.status,
        message: "Pago en procesamiento",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Payment was refused
      const refusedReason = result.refusedReason || "Pago rechazado por la operadora";
      console.error("[PAYBEEHIVE] Payment refused:", refusedReason);
      return new Response(JSON.stringify({ 
        success: false, 
        error: refusedReason,
        status: result.status,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PAYBEEHIVE] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
