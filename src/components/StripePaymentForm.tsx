import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  productName?: string;
  customerEmail?: string;
  customerName?: string;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  productName = 'Diamantes Free Fire',
  customerEmail = '',
  customerName = ''
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get UTMify leadId from localStorage
  const getUtmifyLeadId = (): string => {
    try {
      const utmifyData = localStorage.getItem('utmify_lead');
      if (utmifyData) {
        const parsed = JSON.parse(utmifyData);
        return parsed._id || parsed.leadId || '';
      }
      // Try alternative storage key
      const pixelData = localStorage.getItem('utmify_pixel_data');
      if (pixelData) {
        const parsed = JSON.parse(pixelData);
        return parsed._id || parsed.leadId || '';
      }
    } catch (e) {
      console.log('Could not read UTMify leadId from localStorage');
    }
    return '';
  };

  // Get UTM parameters from URL or localStorage
  const getUtmParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Try to get from URL first, then localStorage
    const getParam = (key: string): string => {
      const urlValue = urlParams.get(key);
      if (urlValue) return urlValue;
      
      try {
        const stored = localStorage.getItem(`utm_${key}`) || localStorage.getItem(key);
        return stored || '';
      } catch {
        return '';
      }
    };

    return {
      src: getParam('src') || getUtmifyLeadId(),
      sck: getParam('sck'),
      utm_source: getParam('utm_source'),
      utm_medium: getParam('utm_medium'),
      utm_campaign: getParam('utm_campaign'),
      utm_content: getParam('utm_content'),
      utm_term: getParam('utm_term'),
    };
  };

  const registerUtmifySale = async (paymentIntentId: string) => {
    try {
      const leadId = getUtmifyLeadId();
      const trackingParams = getUtmParams();
      console.log('[UTMIFY] Registering sale', { paymentIntentId, leadId, trackingParams, amount });

      await supabase.functions.invoke('register-utmify-sale', {
        body: {
          orderId: paymentIntentId,
          email: customerEmail,
          name: customerName,
          value: amount,
          currency: 'USD',
          productName,
          leadId,
          sourceUrl: window.location.href,
          trackingParams,
        }
      });
      
      console.log('[UTMIFY] Sale registered successfully');
    } catch (error) {
      console.error('[UTMIFY] Error registering sale:', error);
      // Don't throw - UTMify issues shouldn't affect user experience
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // Store payment info for UTMify registration on thank you page (in case of redirect)
    const trackingParams = getUtmParams();
    const paymentData = {
      email: customerEmail,
      name: customerName,
      value: amount,
      productName,
      trackingParams,
      leadId: getUtmifyLeadId(),
      sourceUrl: window.location.href,
      timestamp: Date.now(),
    };
    localStorage.setItem('stripe_payment_pending', JSON.stringify(paymentData));
    console.log('[UTMIFY] Stored payment data for thank you page', paymentData);

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
        localStorage.removeItem('stripe_payment_pending');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // UTMify registration is handled by process-card-payment edge function
        console.log('[UTMIFY] Payment succeeded, registration handled by edge function', { paymentIntentId: paymentIntent.id });
        localStorage.removeItem('stripe_payment_pending');
        toast.success('¡Pago realizado con éxito!');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Error al procesar el pago');
      localStorage.removeItem('stripe_payment_pending');
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
