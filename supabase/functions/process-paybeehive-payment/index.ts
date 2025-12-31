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
    const requestBody = await req.json();
    const { 
      priceKey, 
      email, 
      name, 
      cardNumber, 
      cardHolderName, 
      cardExpMonth, 
      cardExpYear, 
      cardCvv,
      trackingParams,
      returnUrl, // URL to redirect after 3DS authentication
      // Browser data for 3DS authentication
      browserData,
    } = requestBody;
    
    console.log("[PAYBEEHIVE] Request received", { priceKey, email, name, hasReturnUrl: !!returnUrl, hasBrowserData: !!browserData });

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

    // Build the return URL for 3DS redirect
    const baseUrl = returnUrl || "https://wzalbseskuzaieeogomm.lovableproject.com";
    const successUrl = `${baseUrl}/thank-you?diamonds=${priceData.diamonds}`;
    const failureUrl = `${baseUrl}/checkout1?payment_failed=true`;

    // Create transaction with PayBeeHive - try without 3DS first, API will redirect if needed
    const transactionPayload: Record<string, unknown> = {
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
      // URLs for redirect after payment
      postbackUrl: successUrl,
      returnUrl: successUrl,
      async: false, // Synchronous transaction to get redirect URL if 3DS required
    };

    // Only add 3DS data if browser data is provided
    if (browserData) {
      transactionPayload.threeDSecure = {
        mpi: {
          version: "2.1.0",
          // Browser data for 3DS challenge
          browserAcceptHeader: browserData.acceptHeader || "*/*",
          browserColorDepth: browserData.colorDepth || "24",
          browserIP: browserData.ip || "",
          browserJavaEnabled: browserData.javaEnabled || false,
          browserLanguage: browserData.language || "pt-BR",
          browserScreenHeight: browserData.screenHeight || "1080",
          browserScreenWidth: browserData.screenWidth || "1920",
          browserTZ: browserData.timezone || "-180",
          browserUserAgent: browserData.userAgent || "",
        },
        successUrl: successUrl,
        failureUrl: failureUrl,
      };
    }

    console.log("[PAYBEEHIVE] Transaction payload:", JSON.stringify(transactionPayload, null, 2));

    console.log("[PAYBEEHIVE] Sending transaction to PayBeeHive API with 3DS...");
    console.log("[PAYBEEHIVE] 3DS URLs:", { successUrl, failureUrl });

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

    // Check for 3DS redirect URL in response
    // Different payment APIs return 3DS URLs in different fields
    const threeDSUrl = result.threeDSecureUrl || 
                       result.authenticationUrl || 
                       result.redirectUrl || 
                       result.payment_url ||
                       result.secure_url ||
                       result.authentication?.url ||
                       result.threeDSecure?.url;

    if (threeDSUrl) {
      console.log("[PAYBEEHIVE] 3DS Authentication required, redirect URL:", threeDSUrl);
      return new Response(JSON.stringify({ 
        success: true,
        requires3DS: true,
        threeDSUrl: threeDSUrl,
        transactionId: result.id,
        status: result.status,
        message: "Redirigiendo para autenticación 3D Secure",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
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
    } else if (result.status === "processing" || result.status === "pending" || result.status === "waiting_payment") {
      console.log("[PAYBEEHIVE] Payment is processing/pending...");
      
      // Check if there's an authentication URL for pending payments
      const pendingAuthUrl = result.links?.find((l: any) => l.rel === "authentication")?.href ||
                             result.actions?.authentication ||
                             result.secure_url;
      
      if (pendingAuthUrl) {
        return new Response(JSON.stringify({ 
          success: true,
          requires3DS: true,
          threeDSUrl: pendingAuthUrl,
          transactionId: result.id,
          status: result.status,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
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
      const refusedReason = result.refusedReason || result.refuse_reason || "Pago rechazado por la operadora";
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
