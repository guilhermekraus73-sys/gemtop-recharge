import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUtmifyHotmartPixel } from "@/hooks/useUtmifyHotmartPixel";

import membershipsBanner from "@/assets/memberships-banner.jpg";
import garenaLogo from "@/assets/garena-logo.png";
import freefireIcon from "@/assets/freefire-character.png";
import freefireBanner from "@/assets/freefire-banner.png";
import diamondIcon from "@/assets/diamond-icon.png";
import paymentNequi from "@/assets/payment-nequi.png";
import paymentYape from "@/assets/payment-yape.png";
import paymentMercadopago from "@/assets/payment-mercadopago.png";
import paymentEfecty from "@/assets/payment-efecty.svg";
import paymentBancolombia from "@/assets/payment-bancolombia.png";
import paymentPaypal from "@/assets/payment-paypal.png";
import paymentPse from "@/assets/payment-pse.png";

type Package = {
  id: number;
  diamonds: number;
  price: number;
  bonus: number;
  paymentUrl: string;
};

const packages: Package[] = [
  { id: 1, diamonds: 5600, price: 9.0, bonus: 1120, paymentUrl: "https://6przeb-pi.myshopify.com/cart/51470212923712:1?channel=buy_button" },
  { id: 2, diamonds: 11200, price: 15.9, bonus: 2240, paymentUrl: "https://6przeb-pi.myshopify.com/cart/51470212956480:1?channel=buy_button" },
  { id: 3, diamonds: 22400, price: 19.0, bonus: 4480, paymentUrl: "https://6przeb-pi.myshopify.com/cart/51470212956480:1?channel=buy_button" },
];

const paymentMethods = [
  { id: "credit", name: "Crédito / Débito", type: "cards" },
  { id: "nequi", name: "NEQUI", logo: paymentNequi },
  { id: "yape", name: "Yape", logo: paymentYape },
  { id: "mercadopago", name: "MercadoPago", logo: paymentMercadopago },
  { id: "efecty", name: "Efecty Bancolombia", logos: [paymentEfecty, paymentBancolombia] },
  { id: "paypal", name: "PayPal", logo: paymentPaypal },
  { id: "pse", name: "PSE", logo: paymentPse },
];

const Recharge: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [searchParams] = useSearchParams();
  useUtmifyHotmartPixel();

  const handleContinue = () => {
    if (!selectedPackage) {
      alert("Por favor, selecciona un paquete de Diamantes.");
      return;
    }
    if (!selectedPayment) {
      alert("Por favor, selecciona un método de pago.");
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    const url = new URL(pkg.paymentUrl);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'sck'];

    utmKeys.forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    // Buscar xcod de múltiplas fontes: URL params, localStorage (UTMify), ou src param
    let xcodValue = searchParams.get('xcod') || searchParams.get('src');
    
    // Tentar buscar do localStorage onde o UTMify armazena
    if (!xcodValue) {
      try {
        const utmifyData = localStorage.getItem('utmify_data');
        if (utmifyData) {
          const parsed = JSON.parse(utmifyData);
          xcodValue = parsed.xcod || parsed.src || parsed.leadId;
        }
      } catch (e) {
        console.log('Could not read UTMify data from localStorage');
      }
    }

    // Tentar buscar do cookie do UTMify
    if (!xcodValue) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'xcod' || name === 'utmify_xcod') {
          xcodValue = value;
          break;
        }
      }
    }

    if (xcodValue) {
      url.searchParams.set('xcod', xcodValue);
      url.searchParams.set('src', xcodValue); // Passar também como src para compatibilidade
    }

    console.log('Redirecting to Hotmart:', url.toString());
    window.location.href = url.toString();
  };

  const selectedPack = packages.find((p) => p.id === selectedPackage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white py-3 px-4 border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <img src={garenaLogo} alt="Garena" className="h-5" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground leading-tight">Canal Oficial de</span>
            <span className="text-xs font-medium text-foreground leading-tight">Recarga</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        {/* Banner */}
        <div className="rounded-xl overflow-hidden mb-6">
          <img src={membershipsBanner} alt="Memberships" className="w-full h-auto" />
        </div>

        {/* Game Selection */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Selección de Juego</h2>

          {/* Mini selected card */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary">
              <img src={freefireIcon} alt="Free Fire" className="w-5 h-5" />
              <span className="text-sm font-medium text-foreground">Free Fire</span>
            </div>
          </div>

          {/* Main game banner */}
          <div className="rounded-xl overflow-hidden">
            <img src={freefireBanner} alt="Free Fire - Pago 100% seguro" className="w-full h-auto" />
          </div>
        </section>

        {/* Step 1 - Account */}
        <section className="info-box mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="step-number">1</div>
            <span className="font-semibold text-foreground">Cuenta</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-discount/10 rounded-lg border border-discount/30">
            <div className="w-10 h-10 rounded-full bg-discount/20 flex items-center justify-center">
              <span className="text-lg">✓</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Jugador identificado</p>
              <p className="text-sm text-discount">Desbloqueado 70% de descuento</p>
            </div>
          </div>
        </section>

        {/* Step 2 - Recharge Value */}
        <section className="info-box mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="step-number">2</div>
            <span className="font-semibold text-foreground">Valor de Recarga</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={
                  "package-card text-center text-sm " +
                  (selectedPackage === pkg.id ? "selected" : "")
                }
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <img src={diamondIcon} alt="Diamond" className="w-5 h-5" />
                  <span className="font-bold text-foreground">{pkg.diamonds.toLocaleString()}</span>
                </div>
                <p className="font-semibold text-primary">US$ {pkg.price.toFixed(2)}</p>
                <p className="text-xs text-bonus font-medium">
                  + Bonus {pkg.bonus.toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Tus créditos se acreditarán a tu cuenta de juego tan pronto como recibamos la confirmación del
            pago. [Para FF] Además de los diamantes de bonificación, también recibirás una bonificación del
            20% en los artículos del juego.
          </p>

          <p className="text-xs text-primary font-medium">
            ¡El importe de la recarga se convertirá automáticamente a tu moneda local!
          </p>
        </section>

        {/* Step 3 - Payment Method */}
        <section className="info-box mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="step-number">3</div>
            <span className="font-semibold text-foreground">Método de pago</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={
                  "payment-card flex flex-col items-center justify-center min-h-[70px] text-center " +
                  (selectedPayment === method.id ? "selected" : "")
                }
              >
                <span className="promo-badge">PROMO</span>

                {method.type === "cards" && (
                  <>
                    <span className="text-[10px] font-medium text-foreground mb-1">{method.name}</span>
                    <div className="flex gap-1">
                      <span className="text-[8px] px-1 bg-muted rounded">ELO</span>
                      <span className="text-[8px] px-1 bg-muted rounded">VISA</span>
                      <span className="text-[8px] px-1 bg-muted rounded">MC</span>
                      <span className="text-[8px] px-1 bg-muted rounded">AMEX</span>
                    </div>
                  </>
                )}

                {method.logo && (
                  <>
                    <img src={method.logo} alt={method.name} className="h-10 mb-1 object-contain max-w-[60px]" />
                    <span className="text-[10px] text-muted-foreground">{method.name}</span>
                  </>
                )}

                {method.logos && (
                  <>
                    <div className="flex gap-1 mb-1">
                      {method.logos.map((logo: string, idx: number) => (
                        <img key={idx} src={logo} alt="" className="h-8 object-contain max-w-[45px]" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{method.name}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Summary */}
        {selectedPack && (
          <div className="text-center mb-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <span className="text-foreground">Total: </span>
            <span className="font-bold text-primary text-lg">
              US$ {selectedPack.price.toFixed(2)}
            </span>
            <span className="text-foreground"> por </span>
            <span className="font-bold text-foreground">
              {(selectedPack.diamonds + selectedPack.bonus).toLocaleString()} diamantes
            </span>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl font-semibold btn-primary-gradient"
        >
          Continuar
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-garena-dark py-6 px-4 mt-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs text-primary-foreground/60 mb-3">
            © Garena Online. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Preguntas frecuentes
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Términos y condiciones
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Política de privacidad
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Recharge;
