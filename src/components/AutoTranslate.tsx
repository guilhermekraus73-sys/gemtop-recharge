import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: {
          new (options: {
            pageLanguage: string;
            autoDisplay: boolean;
            includedLanguages?: string;
            layout?: number;
          }, elementId: string): void;
          InlineLayout: {
            SIMPLE: number;
          };
        };
      };
    };
  }
}

const AutoTranslate = () => {
  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'pt', // Idioma original do site
            autoDisplay: false,
            includedLanguages: 'en,es,fr,de,it,pt', // Idiomas disponíveis
          },
          'google_translate_element'
        );
        
        // Auto-translate based on browser language
        setTimeout(() => {
          const fullLang = navigator.language;
          const browserLang = fullLang.split('-')[0];
          console.log('🌍 Idioma detectado:', fullLang, '| Código:', browserLang);
          
          if (browserLang !== 'pt') {
            const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (select) {
              select.value = browserLang;
              select.dispatchEvent(new Event('change'));
              console.log('🌍 Traduzindo para:', browserLang);
            }
          } else {
            console.log('🌍 Site já está em português, sem tradução necessária');
          }
        }, 1000);
      }
    };

    addScript();

    // Hide Google Translate bar with CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate,
      .goog-te-gadget-icon,
      .goog-te-gadget-simple img,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      div#goog-gt-,
      .VIpgJd-ZVi9od-ORHb-OEVmcd {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
      .goog-te-gadget,
      .goog-te-combo,
      .skiptranslate iframe,
      #google_translate_element {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll('script[src*="translate.google.com"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  return <div id="google_translate_element" />;
};

export default AutoTranslate;
