import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackRequest {
  session_id: string;
  step: string;
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// Get country coordinates for map pins
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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: TrackRequest = await req.json();
    const { session_id, step, page_url, utm_source, utm_medium, utm_campaign } = body;

    if (!session_id || !step) {
      return new Response(JSON.stringify({ error: "session_id and step are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get geolocation from request headers (Cloudflare/Supabase provides these)
    const countryCode = req.headers.get("cf-ipcountry") || 
                        req.headers.get("x-country-code") || 
                        null;
    const city = req.headers.get("cf-ipcity") || null;

    // Detect device type from user-agent
    const userAgent = req.headers.get("user-agent") || "";
    let deviceType = "desktop";
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
      deviceType = /ipad|tablet/i.test(userAgent) ? "tablet" : "mobile";
    }

    // Insert event into database
    const { error } = await supabase.from("funnel_events").insert({
      session_id,
      step,
      page_url,
      country_code: countryCode,
      city,
      device_type: deviceType,
      utm_source,
      utm_medium,
      utm_campaign,
    });

    if (error) {
      console.error("[TRACK-FUNNEL] Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[TRACK-FUNNEL] Event tracked: ${step} from ${countryCode || "unknown"}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[TRACK-FUNNEL] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
