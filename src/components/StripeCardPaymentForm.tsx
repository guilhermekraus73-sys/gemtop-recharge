import React, { useState, useEffect } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { PaymentRequest } from '@stripe/stripe-js';
import { track, trackFunnel } from '@/hooks/useFunnelTracking';

interface StripeCardPaymentFormProps {
  priceKey: string;
  amount: number;
  onSuccess: () => void;
  productName?: string;
  customerEmail: string;
  customerName: string;
  onEmailInvalid?: () => void;
  onNameInvalid?: () => void;
}

const elementStyle = {
  base: {
    fontSize: '16px',
    color: '#1a1a1a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    '::placeholder': {
      color: '#9ca3af',
    },
  },
  invalid: {
    color: '#ef4444',
  },
};

// Rate limiting constants
const MAX_ATTEMPTS_PER_CARD = 2;
const MAX_TOTAL_ATTEMPTS = 3;
const MAX_DIFFERENT_CARDS = 3; // Max different cards per session
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_BETWEEN_ATTEMPTS_MS = 35 * 1000; // 35 seconds between attempts

// Get or initialize session payment attempts from sessionStorage
const getPaymentAttempts = () => {
  try {
    const data = sessionStorage.getItem('payment_attempts');
    if (data) {
      const parsed = JSON.parse(data);
      // Check if lockout has expired
      if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
        // Reset after lockout expires
        sessionStorage.removeItem('payment_attempts');
        return { totalAttempts: 0, cardAttempts: {}, uniqueCards: [], lockedUntil: null, lastAttemptTime: null };
      }
      // Ensure uniqueCards array exists for backwards compatibility
      if (!parsed.uniqueCards) {
        parsed.uniqueCards = Object.keys(parsed.cardAttempts || {});
      }
      return parsed;
    }
  } catch (e) {
    console.log('Could not read payment attempts from sessionStorage');
  }
  return { totalAttempts: 0, cardAttempts: {}, uniqueCards: [], lockedUntil: null, lastAttemptTime: null };
};

const savePaymentAttempts = (attempts: { totalAttempts: number; cardAttempts: Record<string, number>; uniqueCards: string[]; lockedUntil: number | null; lastAttemptTime: number | null }) => {
  try {
    sessionStorage.setItem('payment_attempts', JSON.stringify(attempts));
  } catch (e) {
    console.log('Could not save payment attempts to sessionStorage');
  }
};

// Country codes for Latin America + USA
const COUNTRIES = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
];

const StripeCardPaymentForm: React.FC<StripeCardPaymentFormProps> = ({ 
  priceKey,
  amount, 
  onSuccess, 
  productName = 'Diamantes Free Fire',
  customerEmail,
  customerName,
  onEmailInvalid,
  onNameInvalid
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState(customerName);
  const [postalCode, setPostalCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [pagamentoTracked, setPagamentoTracked] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const isFormComplete = cardholderName && cardNumberComplete && cardExpiryComplete && cardCvcComplete;
  const isOnCooldown = cooldownRemaining > 0;

  // Check if user is blocked or on cooldown on mount and update timer
  useEffect(() => {
    const checkStatus = () => {
      const attempts = getPaymentAttempts();
      
      // Check blocked status
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil((attempts.lockedUntil - Date.now()) / 1000));
      } else if (attempts.totalAttempts >= MAX_TOTAL_ATTEMPTS) {
        // Lock the user
        const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        savePaymentAttempts({ ...attempts, lockedUntil });
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      } else {
        setIsBlocked(false);
        setBlockTimeRemaining(0);
      }

      // Check cooldown status
      if (attempts.lastAttemptTime) {
        const cooldownEnd = attempts.lastAttemptTime + COOLDOWN_BETWEEN_ATTEMPTS_MS;
        const remaining = cooldownEnd - Date.now();
        if (remaining > 0) {
          setCooldownRemaining(Math.ceil(remaining / 1000));
        } else {
          setCooldownRemaining(0);
        }
      }
    };

    checkStatus();
    
    // Update countdown every second
    const interval = setInterval(() => {
      const attempts = getPaymentAttempts();
      
      // Update blocked timer
      if (attempts.lockedUntil) {
        const remaining = attempts.lockedUntil - Date.now();
        if (remaining > 0) {
          setBlockTimeRemaining(Math.ceil(remaining / 1000));
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
          setBlockTimeRemaining(0);
          sessionStorage.removeItem('payment_attempts');
        }
      }

      // Update cooldown timer
      if (attempts.lastAttemptTime) {
        const cooldownEnd = attempts.lastAttemptTime + COOLDOWN_BETWEEN_ATTEMPTS_MS;
        const remaining = cooldownEnd - Date.now();
        if (remaining > 0) {
          setCooldownRemaining(Math.ceil(remaining / 1000));
        } else {
          setCooldownRemaining(0);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to record a payment attempt
  const recordPaymentAttempt = (cardLast4: string): boolean => {
    const attempts = getPaymentAttempts();
    
    // Check if already blocked
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return false;
    }

    // Check cooldown between attempts
    if (attempts.lastAttemptTime) {
      const cooldownEnd = attempts.lastAttemptTime + COOLDOWN_BETWEEN_ATTEMPTS_MS;
      if (Date.now() < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
        toast.error(`Por seguridad, espera ${remaining} segundos antes de intentar nuevamente.`);
        setCooldownRemaining(remaining);
        return false;
      }
    }

    // Track unique cards used
    if (!attempts.uniqueCards.includes(cardLast4)) {
      attempts.uniqueCards.push(cardLast4);
    }

    // Check if too many different cards tried (fraud pattern)
    if (attempts.uniqueCards.length > MAX_DIFFERENT_CARDS) {
      toast.error('Tu banco rechazó la transacción. Por seguridad, espera unos minutos antes de intentar nuevamente.');
      attempts.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      attempts.lastAttemptTime = Date.now();
      savePaymentAttempts(attempts);
      setIsBlocked(true);
      setBlockTimeRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      return false;
    }

    // Increment total attempts
    attempts.totalAttempts += 1;
    
    // Increment card-specific attempts
    attempts.cardAttempts[cardLast4] = (attempts.cardAttempts[cardLast4] || 0) + 1;

    // Record attempt time for cooldown
    attempts.lastAttemptTime = Date.now();
    setCooldownRemaining(Math.ceil(COOLDOWN_BETWEEN_ATTEMPTS_MS / 1000));

    // Check limits
    const cardAttemptsForThis = attempts.cardAttempts[cardLast4];
    
    if (cardAttemptsForThis > MAX_ATTEMPTS_PER_CARD) {
      toast.error('Tu banco rechazó la transacción. Por seguridad, espera unos minutos antes de intentar nuevamente.');
      attempts.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      savePaymentAttempts(attempts);
      setIsBlocked(true);
      setBlockTimeRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      return false;
    }

    if (attempts.totalAttempts >= MAX_TOTAL_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      savePaymentAttempts(attempts);
      setIsBlocked(true);
      setBlockTimeRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      return false;
    }

    savePaymentAttempts(attempts);
    return true;
  };

  // Function to clear attempts on success
  const clearPaymentAttempts = () => {
    sessionStorage.removeItem('payment_attempts');
    setIsBlocked(false);
    setBlockTimeRemaining(0);
  };

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

  // UTMify registration for 3D Secure payments (edge function can't register these)
  // Non-3DS payments are registered by the edge function directly
  const registerUtmifySaleFor3DS = async (paymentIntentId: string) => {
    try {
      const leadId = getUtmifyLeadId();
      const trackingParams = getUtmParams();
      console.log('[UTMIFY] Registering 3DS sale', { paymentIntentId, leadId, trackingParams, amount });

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
      
      console.log('[UTMIFY] 3DS sale registered successfully');
    } catch (error) {
      console.error('[UTMIFY] Error registering 3DS sale:', error);
    }
  };

  // Log for non-3DS payments (already registered by edge function)
  const logPaymentSuccess = (paymentIntentId: string) => {
    console.log('[UTMIFY] Payment succeeded, registration handled by edge function', { paymentIntentId });
  };

  // Initialize Payment Request (Apple Pay / Google Pay) - Run ASAP when stripe loads
  useEffect(() => {
    if (!stripe || paymentRequest) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: productName,
        amount: Math.round(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check immediately without waiting
    pr.canMakePayment().then(result => {
      if (result) {
        console.log('[PAYMENT] Apple Pay / Google Pay available:', result);
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    setPaymentRequest(pr); // Set immediately so button can render when ready
  }, [stripe]); // Only depend on stripe to run ASAP

  // Handle wallet payment events separately
  useEffect(() => {
    if (!paymentRequest || !stripe) return;

    const handlePaymentMethod = async (ev: any) => {
      console.log('[PAYMENT] PaymentMethod from wallet:', ev.paymentMethod.id);
      
      try {
        const trackingParams = getUtmParams();
        const { data, error } = await supabase.functions.invoke('process-card-payment', {
          body: {
            paymentMethodId: ev.paymentMethod.id,
            priceKey,
            email: ev.payerEmail || customerEmail,
            name: ev.payerName || customerName,
            trackingParams,
          }
        });

        if (error) throw error;

        // Handle rate limiting from backend
        if (data.rate_limited) {
          ev.complete('fail');
          setIsBlocked(true);
          setBlockTimeRemaining(10 * 60); // 10 minutes
          toast.error('Tu banco rechazó la transacción. Por seguridad, espera unos minutos antes de intentar nuevamente.');
          return;
        }

        if (data.requires_action && data.client_secret) {
          // Handle 3D Secure with billing details for wallet payments
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
            payment_method: ev.paymentMethod.id
          });
          
          if (confirmError) {
            ev.complete('fail');
            toast.error('Tu banco rechazó la transacción. Por seguridad, espera unos minutos antes de intentar nuevamente.');
            return;
          }

          if (paymentIntent?.status === 'succeeded') {
            ev.complete('success');
            clearPaymentAttempts();
            await registerUtmifySaleFor3DS(paymentIntent.id);
            trackFunnel('comprou', { productId: productName, source: new URLSearchParams(window.location.search).get('utm_source') || localStorage.getItem('utm_source') || null });
            toast.success('¡Pago realizado con éxito!');
            onSuccess();
          }
        } else if (data.success) {
          ev.complete('success');
          clearPaymentAttempts();
          logPaymentSuccess(data.paymentIntentId);
          trackFunnel('comprou', { productId: productName, source: new URLSearchParams(window.location.search).get('utm_source') || localStorage.getItem('utm_source') || null });
          toast.success('¡Pago realizado con éxito!');
          onSuccess();
        } else {
          ev.complete('fail');
          toast.error(data.error ? 'Tu banco rechazó la transacción. Por seguridad, espera unos minutos.' : 'Tu banco no pudo procesar el pago.');
        }
      } catch (err: any) {
        console.error('[PAYMENT] Wallet payment error:', err);
        ev.complete('fail');
        // Check if it's a rate limit error (429)
        if (err?.status === 429 || err?.message?.includes('rate') || err?.message?.includes('tentativas')) {
          setIsBlocked(true);
          setBlockTimeRemaining(10 * 60);
        }
        toast.error('Tu banco no pudo completar la verificación. Intenta de nuevo en unos minutos.');
      }
    };

    paymentRequest.on('paymentmethod', handlePaymentMethod);
    
    return () => {
      paymentRequest.off('paymentmethod', handlePaymentMethod);
    };
  }, [paymentRequest, stripe, priceKey, customerEmail, customerName]);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before processing
    if (!customerEmail || !customerEmail.trim()) {
      toast.error('El correo electrónico es obligatorio');
      onEmailInvalid?.();
      return;
    }

    if (!isValidEmail(customerEmail)) {
      toast.error('Ingresa un correo electrónico válido (ej: nombre@gmail.com)');
      onEmailInvalid?.();
      return;
    }

    // Validate name
    if (!customerName || !customerName.trim()) {
      toast.error('El nombre completo es obligatorio');
      onNameInvalid?.();
      return;
    }

    // Check if blocked before processing
    if (isBlocked) {
      toast.error('Pagamento temporariamente indisponível. Tente novamente em alguns minutos.');
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      toast.error('Error al cargar el formulario de pago');
      return;
    }

    setIsProcessing(true);

    try {
      // Create PaymentMethod from card details with billing info to reduce declines
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: cardholderName,
          email: customerEmail,
          address: {
            postal_code: postalCode || undefined,
            country: selectedCountry, // User selected country for AVS validation
          }
        },
      });

      if (pmError) {
        toast.error(pmError.message || 'Error al procesar la tarjeta');
        setIsProcessing(false);
        return;
      }

      // Get card last 4 digits for rate limiting
      const cardLast4 = paymentMethod.card?.last4 || 'unknown';
      
      // Record attempt and check if allowed
      if (!recordPaymentAttempt(cardLast4)) {
        setIsProcessing(false);
        return;
      }

      console.log('[PAYMENT] PaymentMethod created:', paymentMethod.id);

      // Call edge function to create and confirm payment in one step
      const trackingParams = getUtmParams();
      const { data, error } = await supabase.functions.invoke('process-card-payment', {
        body: {
          paymentMethodId: paymentMethod.id,
          priceKey,
          email: customerEmail,
          name: cardholderName,
          trackingParams,
        }
      });

      if (error) throw error;

      console.log('[PAYMENT] Response:', data);

      // Handle rate limiting from backend
      if (data.rate_limited) {
        setIsBlocked(true);
        setBlockTimeRemaining(10 * 60); // 10 minutes
        toast.error('Tu banco rechazó la transacción. Por seguridad, espera unos minutos antes de intentar nuevamente.');
        setIsProcessing(false);
        return;
      }

      if (data.requires_action && data.client_secret) {
        // Handle 3D Secure authentication with billing details to reduce declines
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: cardholderName,
              email: customerEmail,
              address: {
                postal_code: postalCode || undefined,
                country: selectedCountry, // User selected country for AVS validation
              }
            }
          }
        });
        
        if (confirmError) {
          toast.error('Tu banco rechazó la transacción. Por seguridad, espera unos minutos antes de intentar nuevamente.');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          clearPaymentAttempts();
          await registerUtmifySaleFor3DS(paymentIntent.id);
          trackFunnel('comprou', { productId: productName, source: new URLSearchParams(window.location.search).get('utm_source') || localStorage.getItem('utm_source') || null });
          toast.success('¡Pago realizado con éxito!');
          onSuccess();
          return;
        }
      }

      if (data.success) {
        // Payment succeeded without 3DS - clear attempts
        clearPaymentAttempts();
        logPaymentSuccess(data.paymentIntentId);
        trackFunnel('comprou', { productId: productName, source: new URLSearchParams(window.location.search).get('utm_source') || localStorage.getItem('utm_source') || null });
        toast.success('¡Pago realizado con éxito!');
        onSuccess();
      } else if (data.error) {
        // Payment failed (card declined, etc.) - friendly message to reduce insistence
        const isDeclined = data.error.includes('declined') || data.error.includes('failed');
        toast.error(isDeclined 
          ? 'Tu banco rechazó la transacción. Por seguridad, espera unos minutos antes de intentar nuevamente.' 
          : 'Tu banco no pudo procesar el pago. Intenta con otra forma de pago o contacta a tu banco.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Tu banco no pudo completar la verificación. Intenta de nuevo en unos minutos.');
      setIsProcessing(false);
    }
  };

  // Format remaining time
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If blocked, show blocked message
  if (isBlocked) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-amber-800 mb-2">
            Tu banco requiere verificación adicional
          </h3>
          <p className="text-amber-700 mb-4">
            Por seguridad, tu banco ha bloqueado temporalmente nuevas transacciones. 
            Esto es normal cuando hay múltiples intentos de pago.
          </p>
          <p className="text-amber-700 mb-4">
            Por favor, espera unos minutos o contacta a tu banco para autorizar la compra.
          </p>
          <div className="text-2xl font-mono font-bold text-amber-800">
            {formatTimeRemaining(blockTimeRemaining)}
          </div>
          <p className="text-sm text-amber-600 mt-2">
            Tiempo de espera recomendado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Apple Pay / Google Pay Button */}
      {canMakePayment && paymentRequest && (
        <>
          <div className="space-y-2">
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: {
                  paymentRequestButton: {
                    type: 'default',
                    theme: 'dark',
                    height: '48px',
                  },
                },
              }}
            />
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">o pagar con tarjeta</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

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
          <div className="h-12 px-3 flex items-center border border-gray-300 rounded-md bg-white">
            <CardNumberElement 
              options={{ style: elementStyle, showIcon: true }}
              onChange={(e) => {
                setCardNumberComplete(e.complete);
                // Track 'pagamento' when user starts filling card
                if (!pagamentoTracked) {
                  console.log('[FUNNEL] Disparando pagamento - card focus');
                  const source = new URLSearchParams(window.location.search).get('utm_source') || 
                                 localStorage.getItem('utm_source') || null;
                  trackFunnel('pagamento', { productId: `diamantes-${priceKey}`, source });
                  setPagamentoTracked(true);
                }
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-foreground font-medium text-sm">
              Vencimiento
            </label>
            <div className="h-12 px-3 flex items-center border border-gray-300 rounded-md bg-white">
              <CardExpiryElement 
                options={{ style: elementStyle }}
                onChange={(e) => setCardExpiryComplete(e.complete)}
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-foreground font-medium text-sm">
              CVV
            </label>
            <div className="h-12 px-3 flex items-center border border-gray-300 rounded-md bg-white">
              <CardCvcElement 
                options={{ style: elementStyle }}
                onChange={(e) => setCardCvcComplete(e.complete)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Country Selector */}
        <div className="space-y-2">
          <label className="block text-foreground font-medium text-sm">
            País de la tarjeta
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full h-12 px-3 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <label className="block text-foreground font-medium text-sm">
            Código postal
          </label>
          <Input
            type="text"
            placeholder="Ej: 10001, 110111"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 10))}
            className="h-12 bg-white text-black border-gray-300"
            maxLength={10}
          />
          <p className="text-xs text-muted-foreground">
            Agregar tu código postal reduce rechazos de pago
          </p>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Shield className="w-4 h-4" />
          <span>Pago 100% seguro con encriptación SSL</span>
        </div>

        {/* Cooldown Notice */}
        {isOnCooldown && !isProcessing && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-amber-700 text-sm">
              Por seguridad, espera <span className="font-bold">{cooldownRemaining}s</span> antes de intentar nuevamente
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements || !isFormComplete || isOnCooldown}
          className="w-full h-14 bg-discount hover:bg-discount/90 text-primary-foreground text-lg font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : isOnCooldown ? (
            <>
              <Lock className="w-5 h-5" />
              Espera {cooldownRemaining}s...
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

export default StripeCardPaymentForm;
