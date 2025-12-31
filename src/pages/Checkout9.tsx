import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import StripeCardPaymentForm from '@/components/StripeCardPaymentForm';
import diamondBonus from '@/assets/diamond-bonus.png';
import membershipsBanner from '@/assets/memberships-banner.jpg';
import { useUtmifyStripePixel } from '@/hooks/useUtmifyStripePixel';

const stripePromise = loadStripe('pk_live_51Q0TEVDSZSnaeaRaLi0yvUWr1YsyCtyYZOG0x4KESqZ1DIxv58CkU9FfYAqMaQQzxxZ4UnPSGF9nYVo2an5aEs15006nLskD1m');

// Detectar idioma do navegador para tradução do Stripe
const getBrowserLocale = (): string => {
  const lang = navigator.language.split('-')[0];
  const supportedLocales = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ja', 'zh'];
  return supportedLocales.includes(lang) ? lang : 'auto';
};

const Checkout9: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ minutes: 9, seconds: 59 });
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  useUtmifyStripePixel();

  const priceKey = '9';
  const priceUsd = 9.00;
  const diamonds = 5600;

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
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Nombre completo</label>
                <Input
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>
            </div>

            {/* Payment Section */}
            <Elements stripe={stripePromise} options={{ locale: getBrowserLocale() as any }}>
              <StripeCardPaymentForm 
                priceKey={priceKey}
                amount={priceUsd}
                onSuccess={handlePaymentSuccess}
                productName={`${diamonds.toLocaleString()} Diamantes Free Fire`}
                customerEmail={email}
                customerName={fullName}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout9;
