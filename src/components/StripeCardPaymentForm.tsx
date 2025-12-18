import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Shield, Lock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StripeCardPaymentFormProps {
  priceKey: string;
  amount: number;
  onSuccess: () => void;
  productName?: string;
  customerEmail: string;
  customerName: string;
}

const StripeCardPaymentForm: React.FC<StripeCardPaymentFormProps> = ({ 
  priceKey,
  amount, 
  onSuccess, 
  productName = 'Diamantes Free Fire',
  customerEmail,
  customerName
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // Get UTMify leadId from localStorage
  const getUtmifyLeadId = (): string => {
    try {
      const utmifyData = localStorage.getItem('utmify_lead');
      if (utmifyData) {
        const parsed = JSON.parse(utmifyData);
        return parsed._id || parsed.leadId || '';
      }
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Error al cargar el formulario de pago');
      return;
    }

    setIsProcessing(true);

    try {
      // Create PaymentMethod from card details
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerName,
          email: customerEmail,
        },
      });

      if (pmError) {
        toast.error(pmError.message || 'Error al procesar la tarjeta');
        setIsProcessing(false);
        return;
      }

      console.log('[PAYMENT] PaymentMethod created:', paymentMethod.id);

      // Call edge function to create and confirm payment in one step
      const { data, error } = await supabase.functions.invoke('process-card-payment', {
        body: {
          paymentMethodId: paymentMethod.id,
          priceKey,
          email: customerEmail,
          name: customerName,
        }
      });

      if (error) throw error;

      console.log('[PAYMENT] Response:', data);

      if (data.requires_action && data.client_secret) {
        // Handle 3D Secure authentication
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret);
        
        if (confirmError) {
          toast.error(confirmError.message || 'Tarjeta rechazada');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          await registerUtmifySale(paymentIntent.id);
          toast.success('¡Pago realizado con éxito!');
          onSuccess();
          return;
        }
      }

      if (data.success) {
        // Payment succeeded without 3DS
        await registerUtmifySale(data.paymentIntentId);
        toast.success('¡Pago realizado con éxito!');
        onSuccess();
      } else if (data.error) {
        // Payment failed (card declined, etc.)
        toast.error(data.error.includes('declined') ? 'Tarjeta rechazada' : data.error);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Error al procesar el pago');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Element */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-foreground font-medium">
          <CreditCard className="w-4 h-4" />
          Datos de la tarjeta
        </label>
        <div className="p-4 border border-border rounded-lg bg-background">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#fff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
              hidePostalCode: true,
            }}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Shield className="w-4 h-4" />
        <span>Pago 100% seguro con encriptación SSL</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements || !cardComplete}
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

export default StripeCardPaymentForm;
