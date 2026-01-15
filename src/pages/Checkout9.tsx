import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardPaymentForm from '@/components/StripeCardPaymentForm';
import diamondBonus from '@/assets/diamond-bonus.png';
import membershipsBanner from '@/assets/memberships-banner.jpg';
import { useUtmifyStripePixel } from '@/hooks/useUtmifyStripePixel';
import { track, trackFunnel } from '@/hooks/useFunnelTracking';

const stripePromise = loadStripe('pk_live_51SpalPJuI6JxdCYqQWQzcLFBvPCF0TlAQVrQYoXzigDiOTWYWtQfHgWeLcQqYrAqIphnZx0U2zripyMuDtHpfdNp00tPNbhsrR');

// Email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const Checkout9: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ minutes: 9, seconds: 59 });
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [dadosTracked, setDadosTracked] = useState(false);
  useUtmifyStripePixel();
  
  const getSource = () => new URLSearchParams(window.location.search).get('utm_source') || 
                          localStorage.getItem('utm_source') || null;

  const priceKey = '9';
  const priceUsd = 9.00;
  const diamonds = 5600;

  // Track funnel on checkout page load
  useEffect(() => {
    const source = new URLSearchParams(window.location.search).get('utm_source') || 
                   localStorage.getItem('utm_source') || null;
    track('checkout', 'diamantes-9', source);
  }, []);

  // Track 'dados' on first keystroke in email field
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Track 'dados' immediately on first input
    if (!dadosTracked && value.length > 0) {
      console.log('[FUNNEL] Disparando dados - primeiro keystroke');
      trackFunnel('dados', { productId: 'diamantes-9', source: getSource() });
      setDadosTracked(true);
    }
    
    if (emailTouched) {
      if (!value.trim()) {
        setEmailError('El correo electrónico es obligatorio');
      } else if (!isValidEmail(value)) {
        setEmailError('Ingresa un correo electrónico válido');
      } else {
        setEmailError('');
      }
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!email.trim()) {
      setEmailError('El correo electrónico es obligatorio');
    } else if (!isValidEmail(email)) {
      setEmailError('Ingresa un correo electrónico válido');
    } else {
      setEmailError('');
    }
  };
  
  const handleNameBlur = () => {
    // No additional tracking needed - dados already tracked on first keystroke
  };

  const isFormValid = isValidEmail(email) && fullName.trim().length > 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const handlePaymentSuccess = () => {
    navigate('/obrigado');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Header */}
      <div className="bg-destructive py-3">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <span className="text-primary-foreground text-3xl md:text-4xl font-bold tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-2 text-primary-foreground">
            <Clock className="w-5 h-5" />
            <span className="text-sm md:text-base font-medium">PROMOCIÓN SOLO HOY</span>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <img
            src={membershipsBanner}
            alt="¡Conoce las Membresías Free Fire!"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Checkout Form */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
            {/* Product Info */}
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={diamondBonus} 
                alt="Bono de Diamantes" 
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground">Bono de Diamantes - Free Fire</h3>
                <p className="text-muted-foreground">{diamonds.toLocaleString()} + Bonus</p>
                <p className="text-green-500 font-bold text-lg">
                  Total: $ {priceUsd.toFixed(2)} USD
                </p>
              </div>
            </div>

            {/* Customer Info Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-foreground font-medium mb-2">Tu correo electrónico</label>
                <Input
                  type="email"
                  placeholder="Ingresa tu correo para recibir la compra"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`h-12 bg-muted border-border ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                {emailError && (
                  <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Nombre completo</label>
                <Input
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={handleNameBlur}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>
            </div>

            {/* Payment Section with Stripe */}
            <Elements stripe={stripePromise}>
              <StripeCardPaymentForm 
                priceKey={priceKey}
                amount={priceUsd}
                onSuccess={handlePaymentSuccess}
                productName={`${diamonds.toLocaleString()} Diamantes Free Fire`}
                customerEmail={email.trim()}
                customerName={fullName}
                onEmailInvalid={() => {
                  setEmailTouched(true);
                  if (!email.trim()) {
                    setEmailError('El correo electrónico es obligatorio');
                  } else {
                    setEmailError('Ingresa un correo electrónico válido');
                  }
                }}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout9;
