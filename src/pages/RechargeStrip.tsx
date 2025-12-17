import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const membershipsBanner = "https://recargasdiamante.site/assets/memberships-banner-new-CLtuAl-k.jpg";
const garenaLogo = "https://recargasdiamante.site/assets/garena-logo-new-BpIrME3Z.png";
const freefireCard = "https://recargasdiamante.site/assets/freefire-character-CGZceXtZ.png";
const diamondIcon = "https://recargasdiamante.site/assets/diamond-icon-DfkGj-iT.png";

type Package = {
  id: number;
  diamonds: number;
  price: number;
  bonus: number;
  checkoutRoute: string;
};

const packages: Package[] = [
  { id: 1, diamonds: 5600, price: 9.0, bonus: 1120, checkoutRoute: "/checkout9" },
  { id: 2, diamonds: 11200, price: 15.9, bonus: 2240, checkoutRoute: "/checkout15" },
  { id: 3, diamonds: 22400, price: 19.0, bonus: 4480, checkoutRoute: "/checkout19" },
];

const paymentMethods = [
  { id: "credit", name: "Crédito / Débito", type: "cards" },
  { id: "nequi", name: "NEQUI", logo: "https://recargasdiamante.site/assets/payment-nequi-DMZgP08t.svg" },
  { id: "yape", name: "Yape", logo: "https://recargasdiamante.site/assets/payment-yape-koqgwqlR.png" },
  { id: "mercadopago", name: "MercadoPago", logo: "https://recargasdiamante.site/assets/payment-mercadopago-LqiSogzV.png" },
  {
    id: "efecty",
    name: "Efecty Bancolombia",
    logos: [
      "https://recargasdiamante.site/assets/payment-efecty-m22drQrj.png",
      "https://recargasdiamante.site/assets/payment-bancolombia-BThx0E4T.png",
    ],
  },
  { id: "paypal", name: "PayPal", logo: "https://recargasdiamante.site/assets/payment-paypal-Dw1SPWUh.png" },
  { id: "pse", name: "PSE", logo: "https://recargasdiamante.site/assets/payment-pse-B40taAPz.png" },
];

const RechargeStrip: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

    // Navegar para o checkout interno com parâmetros UTM
    const utmParams = searchParams.toString();
    navigate(pkg.checkoutRoute + (utmParams ? '?' + utmParams : ''));
  };

  const selectedPack = packages.find((p) => p.id === selectedPackage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="header-white py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src={garenaLogo} alt="Garena" className="h-8" />
          <span className="font-semibold text-lg text-foreground">Centro Oficial de Recargas</span>
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

          <div className="game-card game-card-selected">
            <div className="flex items-center gap-3 p-4">
              <img src={freefireCard} alt="Free Fire" className="w-16 h-16 rounded-lg" />
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Free Fire</h3>
                <p className="text-xs text-muted-foreground">© Pagamento 100% Seguro</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
            </div>
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
                  + Bônus {pkg.bonus.toLocaleString()}
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
                    <img src={method.logo} alt={method.name} className="h-6 mb-1 object-contain" />
                    <span className="text-[10px] text-muted-foreground">{method.name}</span>
                  </>
                )}

                {method.logos && (
                  <>
                    <div className="flex gap-1 mb-1">
                      {method.logos.map((logo: string, idx: number) => (
                        <img key={idx} src={logo} alt="" className="h-5 object-contain" />
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

export default RechargeStrip;
