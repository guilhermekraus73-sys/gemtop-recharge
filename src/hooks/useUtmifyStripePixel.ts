import { useEffect } from 'react';

export const useUtmifyStripePixel = () => {
  useEffect(() => {
    // Set the Stripe UTMify pixel ID
    (window as any).pixelId = "694319ad74dd503618cd6322";

    // Add the pixel script
    const pixelScript = document.createElement("script");
    pixelScript.setAttribute("async", "");
    pixelScript.setAttribute("defer", "");
    pixelScript.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
    pixelScript.id = "utmify-pixel-stripe";
    
    if (!document.getElementById("utmify-pixel-stripe")) {
      document.head.appendChild(pixelScript);
    }

    // Add the UTMs script with specific attributes
    const utmsScript = document.createElement("script");
    utmsScript.setAttribute("async", "");
    utmsScript.setAttribute("defer", "");
    utmsScript.setAttribute("src", "https://cdn.utmify.com.br/scripts/utms/latest.js");
    utmsScript.setAttribute("data-utmify-prevent-xcod-sck", "");
    utmsScript.setAttribute("data-utmify-prevent-subids", "");
    utmsScript.id = "utmify-utms-stripe";
    
    if (!document.getElementById("utmify-utms-stripe")) {
      document.head.appendChild(utmsScript);
    }
  }, []);
};
