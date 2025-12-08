import paymentNequi from "@/assets/payment-nequi.svg";
import paymentYape from "@/assets/payment-yape.png";
import paymentMercadopago from "@/assets/payment-mercadopago.png";
import paymentEfecty from "@/assets/payment-efecty.png";
import paymentBancolombia from "@/assets/payment-bancolombia.png";
import paymentPaypal from "@/assets/payment-paypal.png";
import paymentPse from "@/assets/payment-pse.png";

const paymentMethods = [
  {
    id: "credit",
    name: "Crédito / Débito",
    hasCardLogos: true
  },
  {
    id: "nequi",
    name: "NEQUI",
    logo: paymentNequi
  },
  {
    id: "yape",
    name: "Yape",
    logo: paymentYape
  },
  {
    id: "mercadopago",
    name: "MercadoPago",
    logo: paymentMercadopago
  },
  {
    id: "efecty",
    name: "Efecty Bancolombia",
    logos: [paymentEfecty, paymentBancolombia]
  },
  {
    id: "paypal",
    name: "PayPal",
    logo: paymentPaypal
  },
  {
    id: "pse",
    name: "PSE",
    logo: paymentPse
  }
];

interface PaymentSectionProps {
  selectedPayment: string;
  onSelectPayment: (id: string) => void;
}

const PaymentSection = ({
  selectedPayment,
  onSelectPayment
}: PaymentSectionProps) => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="step-number bg-destructive">3</span>
        <span className="font-semibold text-foreground">Método de pago</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            onClick={() => onSelectPayment(method.id)}
            className={`payment-card flex flex-col items-center justify-center min-h-[70px] text-center ${selectedPayment === method.id ? 'selected' : ''}`}
          >
            <span className="promo-badge">PROMO</span>
            
            {method.hasCardLogos && (
              <>
                <span className="text-xs font-medium text-foreground leading-tight mb-1">
                  {method.name}
                </span>
                <div className="flex gap-1">
                  <div className="w-7 h-5 bg-[#00A4E4] rounded-sm flex items-center justify-center">
                    <span className="text-[6px] text-white font-bold">ELO</span>
                  </div>
                  <div className="w-7 h-5 bg-[#1A1F71] rounded-sm flex items-center justify-center">
                    <span className="text-[6px] text-white font-bold">VISA</span>
                  </div>
                  <div className="w-7 h-5 bg-[#EB001B] rounded-sm flex items-center justify-center">
                    <span className="text-[6px] text-white font-bold">MC</span>
                  </div>
                  <div className="w-7 h-5 bg-[#006FCF] rounded-sm flex items-center justify-center">
                    <span className="text-[6px] text-white font-bold">AMEX</span>
                  </div>
                </div>
              </>
            )}
            
            {method.logo && (
              <img src={method.logo} alt={method.name} className="h-8 object-contain" />
            )}
            
            {method.logos && (
              <div className="flex gap-1 items-center">
                {method.logos.map((logo, idx) => (
                  <img key={idx} src={logo} alt={method.name} className="h-6 object-contain" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSection;
