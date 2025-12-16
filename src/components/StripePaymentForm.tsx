import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/obrigado`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast.error(error.message || 'Error al procesar el pago');
        } else {
          toast.error('Ocurrió un error inesperado');
        }
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('¡Pago realizado con éxito!');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Error al procesar el pago');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hide Link banner via CSS */}
      <style>{`
        .p-LinkAutofillPrompt,
        [data-testid="link-autofill-prompt"],
        .LinkAutofillPrompt,
        .p-LinkAuthenticationElement,
        [class*="LinkAutofill"],
        [class*="link-autofill"] {
          display: none !important;
        }
      `}</style>
      <PaymentElement 
        options={{
          layout: 'tabs',
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Shield className="w-4 h-4" />
        <span>Pago 100% seguro con encriptación SSL</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-14 bg-discount hover:bg-discount/90 text-primary-foreground text-lg font-bold rounded-xl flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            PAGAR ${amount.toFixed(2)} USD
          </>
        )}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
