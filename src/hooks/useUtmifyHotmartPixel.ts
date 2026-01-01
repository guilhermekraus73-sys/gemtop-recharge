import { useEffect } from 'react';

export const useUtmifyHotmartPixel = () => {
  useEffect(() => {
    // Set the Hotmart UTMify pixel ID
    (window as any).pixelId = "69278ad9ee8cbd6ab35aae54";

    // Add the pixel script
    const pixelScript = document.createElement("script");
    pixelScript.setAttribute("async", "");
    pixelScript.setAttribute("defer", "");
    pixelScript.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
    pixelScript.id = "utmify-pixel-hotmart";
    
    if (!document.getElementById("utmify-pixel-hotmart")) {
      document.head.appendChild(pixelScript);
    }

    // Add the UTMs script with specific attributes
    const utmsScript = document.createElement("script");
    utmsScript.setAttribute("async", "");
    utmsScript.setAttribute("defer", "");
    utmsScript.setAttribute("src", "https://cdn.utmify.com.br/scripts/utms/latest.js");
    utmsScript.setAttribute("data-utmify-prevent-xcod-sck", "");
    utmsScript.setAttribute("data-utmify-prevent-subids", "");
    utmsScript.id = "utmify-utms-hotmart";
    
    if (!document.getElementById("utmify-utms-hotmart")) {
      document.head.appendChild(utmsScript);
    }
  }, []);
};
