import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUtmifyStripePixel } from "@/hooks/useUtmifyStripePixel";

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
  checkoutRoute: string;
};

const packages: Package[] = [
  { id: 1, diamonds: 5600, price: 9.0, bonus: 1120, checkoutRoute: "/checkout9-en" },
  { id: 2, diamonds: 11200, price: 15.9, bonus: 2240, checkoutRoute: "/checkout15-en" },
  { id: 3, diamonds: 22400, price: 19.0, bonus: 4480, checkoutRoute: "/checkout19-en" },
];

const paymentMethods = [
  { id: "credit", name: "Credit / Debit", type: "cards" },
  { id: "nequi", name: "NEQUI", logo: paymentNequi },
  { id: "yape", name: "Yape", logo: paymentYape },
  { id: "mercadopago", name: "MercadoPago", logo: paymentMercadopago },
  { id: "efecty", name: "Efecty Bancolombia", logos: [paymentEfecty, paymentBancolombia] },
  { id: "paypal", name: "PayPal", logo: paymentPaypal },
  { id: "pse", name: "PSE", logo: paymentPse },
];

const RechargeStripEn: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useUtmifyStripePixel();

  const handleContinue = () => {
    if (!selectedPackage) {
      alert("Please select a Diamond package.");
      return;
    }
    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    // Navigate to internal checkout with UTM parameters
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
          <span className="font-semibold text-lg text-foreground">Official Recharge Center</span>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        {/* Banner */}
        <div className="rounded-xl overflow-hidden mb-6">
          <img src={membershipsBanner} alt="Memberships" className="w-full h-auto" />
        </div>

        {/* Game Selection */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Game Selection</h2>

          {/* Mini selected card */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary">
              <img src={freefireIcon} alt="Free Fire" className="w-5 h-5" />
              <span className="text-sm font-medium text-foreground">Free Fire</span>
            </div>
          </div>

          {/* Main game banner */}
          <div className="rounded-xl overflow-hidden">
            <img src={freefireBanner} alt="Free Fire - 100% Secure Payment" className="w-full h-auto" />
          </div>
        </section>

        {/* Step 1 - Account */}
        <section className="info-box mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="step-number">1</div>
            <span className="font-semibold text-foreground">Account</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-discount/10 rounded-lg border border-discount/30">
            <div className="w-10 h-10 rounded-full bg-discount/20 flex items-center justify-center">
              <span className="text-lg">✓</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Player identified</p>
              <p className="text-sm text-discount">70% discount unlocked</p>
            </div>
          </div>
        </section>

        {/* Step 2 - Recharge Value */}
        <section className="info-box mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="step-number">2</div>
            <span className="font-semibold text-foreground">Recharge Value</span>
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
            Your credits will be added to your game account as soon as we receive payment confirmation.
            [For FF] In addition to bonus diamonds, you'll also receive a 20% bonus on in-game items.
          </p>

          <p className="text-xs text-primary font-medium">
            The recharge amount will be automatically converted to your local currency!
          </p>
        </section>

        {/* Step 3 - Payment Method */}
        <section className="info-box mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="step-number">3</div>
            <span className="font-semibold text-foreground">Payment Method</span>
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
            <span className="text-foreground"> for </span>
            <span className="font-bold text-foreground">
              {(selectedPack.diamonds + selectedPack.bonus).toLocaleString()} diamonds
            </span>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl font-semibold btn-primary-gradient"
        >
          Continue
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-garena-dark py-6 px-4 mt-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs text-primary-foreground/60 mb-3">
            © Garena Online. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              FAQ
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Terms and Conditions
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RechargeStripEn;
