import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

interface PayBeeHivePaymentFormProps {
  priceKey: string;
  amount: number;
  onSuccess: () => void;
  productName?: string;
  customerEmail: string;
  customerName: string;
}

const PayBeeHivePaymentForm: React.FC<PayBeeHivePaymentFormProps> = ({ 
  priceKey,
  amount, 
  onSuccess, 
  productName = 'Diamantes Free Fire',
  customerEmail,
  customerName
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState(customerName);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [searchParams] = useSearchParams();

  // Check for payment failure from 3DS redirect
  useEffect(() => {
    const paymentFailed = searchParams.get('payment_failed');
    if (paymentFailed === 'true') {
      toast.error('La autenticación 3D Secure falló. Por favor, intente nuevamente.');
    }
  }, [searchParams]);

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

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };


  const isFormComplete = 
    cardholderName.length >= 3 && 
    cardNumber.replace(/\s/g, '').length === 16 && 
    cardExpiry.length === 5 && 
    cardCvv.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormComplete) {
      toast.error('Por favor, complete todos los campos');
      return;
    }

    setIsProcessing(true);

    try {
      const trackingParams = getUtmParams();
      const [expMonth, expYear] = cardExpiry.split('/');
      
      // Get the current page URL for 3DS redirect
      const returnUrl = window.location.origin;
      
      console.log('[PAYBEEHIVE] Submitting payment with 3DS support...');

      const { data, error } = await supabase.functions.invoke('process-paybeehive-payment', {
        body: {
          priceKey,
          email: customerEmail,
          name: customerName,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardHolderName: cardholderName,
          cardExpMonth: expMonth,
          cardExpYear: `20${expYear}`,
          cardCvv: cardCvv,
          trackingParams,
          returnUrl, // Send return URL for 3DS redirect
        }
      });

      if (error) {
        console.error('[PAYBEEHIVE] Supabase error:', error);
        throw error;
      }

      console.log('[PAYBEEHIVE] Response:', data);

      // Check if 3DS authentication is required
      if (data.requires3DS && data.threeDSUrl) {
        console.log('[PAYBEEHIVE] Redirecting to 3DS authentication:', data.threeDSUrl);
        toast.info('Redirigiendo para autenticación 3D Secure...');
        
        // Redirect to 3DS authentication page
        window.location.href = data.threeDSUrl;
        return;
      }

      if (data.success) {
        toast.success('¡Pago realizado con éxito!');
        onSuccess();
      } else if (data.pending) {
        toast.info('Pago en procesamiento. Recibirás una confirmación pronto.');
        onSuccess();
      } else {
        toast.error(data.error || 'Tarjeta rechazada. Intente con otra tarjeta.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('[PAYBEEHIVE] Payment error:', err);
      toast.error('Error al procesar el pago. Intente nuevamente.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Brands */}
      <div className="flex items-center justify-center gap-4 pb-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <CreditCard className="w-5 h-5" />
          <span>Visa, Mastercard</span>
        </div>
      </div>

      {/* 3DS Notice */}
      <div className="flex items-center gap-2 text-muted-foreground text-xs bg-muted/30 p-2 rounded-lg">
        <ExternalLink className="w-4 h-4 shrink-0" />
        <span>Tu banco puede solicitar autenticación adicional (3D Secure) para completar el pago.</span>
      </div>

      {/* Card Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cardholder Name */}
        <div className="space-y-2">
          <label className="block text-foreground font-medium text-sm">
            Nombre en la tarjeta
          </label>
          <Input
            type="text"
            placeholder="Como aparece en la tarjeta"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="h-12 bg-white text-black border-gray-300"
            required
          />
        </div>


        {/* Card Number */}
        <div className="space-y-2">
          <label className="block text-foreground font-medium text-sm">
            Número de tarjeta
          </label>
          <Input
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="h-12 bg-white text-black border-gray-300"
            required
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-foreground font-medium text-sm">
              Vencimiento
            </label>
            <Input
              type="text"
              placeholder="MM/AA"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
              className="h-12 bg-white text-black border-gray-300"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-foreground font-medium text-sm">
              CVV
            </label>
            <Input
              type="text"
              placeholder="123"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="h-12 bg-white text-black border-gray-300"
              required
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
          disabled={isProcessing || !isFormComplete}
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
    </div>
  );
};

export default PayBeeHivePaymentForm;
