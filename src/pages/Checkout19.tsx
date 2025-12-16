import React, { useState, useEffect } from 'react';
import { Clock, Shield, Lock, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import diamondBonus from '@/assets/diamond-bonus.png';

const membresiasBanner = "https://recargasdiamante.site/assets/memberships-banner-new-CLtuAl-k.jpg";

const Checkout19: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 9, seconds: 59 });
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const priceUsd = 19.00;
  const diamonds = 22400;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email !== confirmEmail) {
      toast.error('Os emails não coincidem. Verifique e tente novamente.');
      return;
    }
    
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { priceKey: '19', email, name: fullName }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Error al procesar el pago. Intente nuevamente.');
      setIsProcessing(false);
    }
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
            src={membresiasBanner}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-foreground font-medium mb-2">Seu email</label>
                <Input
                  type="email"
                  placeholder="Digite seu email para receber a compra"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Confirme seu email</label>
                <Input
                  type="email"
                  placeholder="Digite novamente seu email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">Nome completo</label>
                <Input
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>

              {/* Payment Info */}
              <div className="bg-muted rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Pago seguro con Stripe</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Serás redirigido a la página de pago seguro de Stripe para completar tu compra.
                </p>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Shield className="w-4 h-4" />
                <span>Pago 100% seguro con encriptación SSL</span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-14 bg-discount hover:bg-discount/90 text-primary-foreground text-lg font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Redirigiendo...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    PAGAR ${priceUsd.toFixed(2)} USD
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout19;
