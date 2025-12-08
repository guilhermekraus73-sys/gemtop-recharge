const paymentMethods = [{
  id: "credit",
  name: "Crédito / Débito",
  hasLogos: true
}, {
  id: "nequi",
  name: "NEQUI"
}, {
  id: "pix",
  name: "PIX"
}, {
  id: "mercadopago",
  name: "MercadoPago"
}, {
  id: "efecty",
  name: "Efecty Bancolombia"
}, {
  id: "paypal",
  name: "PayPal"
}, {
  id: "pse",
  name: "PSE"
}];
interface PaymentSectionProps {
  selectedPayment: string;
  onSelectPayment: (id: string) => void;
}
const PaymentSection = ({
  selectedPayment,
  onSelectPayment
}: PaymentSectionProps) => {
  return <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="step-number bg-destructive">3</span>
        <span className="font-semibold text-foreground">Método de pago</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {paymentMethods.map(method => <div key={method.id} onClick={() => onSelectPayment(method.id)} className={`payment-card flex flex-col items-center justify-center min-h-[65px] text-center ${selectedPayment === method.id ? 'selected' : ''}`}>
            <span className="promo-badge">PROMO</span>
            <span className="text-xs font-medium text-foreground leading-tight">
              {method.name}
            </span>
            {method.hasLogos && <div className="flex gap-1 mt-1">
                <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                  <span className="text-[6px] text-white font-bold">VISA</span>
                </div>
                <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                  <span className="text-[6px] text-white font-bold">MC</span>
                </div>
                <div className="w-6 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-[6px] text-white font-bold">AMEX</span>
                </div>
              </div>}
          </div>)}
      </div>
    </div>;
};
export default PaymentSection;