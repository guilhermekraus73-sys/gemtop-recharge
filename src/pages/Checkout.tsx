import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Clock, Shield, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import diamondHotmart from '@/assets/diamond-hotmart.jpg';
import membershipsBanner from '@/assets/memberships-banner.jpg';

interface Package {
  id: string;
  diamonds: number;
  bonus: number;
  priceUsd: number;
}

const packages: Record<string, Package> = {
  'oferta1': { id: 'oferta1', diamonds: 5600, bonus: 1120, priceUsd: 9.00 },
  'oferta2': { id: 'oferta2', diamonds: 11200, bonus: 2240, priceUsd: 15.90 },
  'oferta3': { id: 'oferta3', diamonds: 22400, bonus: 4480, priceUsd: 19.00 },
};

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('id') || 'oferta1';
  const selectedPackage = packages[packageId] || packages['oferta1'];

  const [timeLeft, setTimeLeft] = useState({ minutes: 9, seconds: 59 });
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert('Este é apenas um preview do checkout. A integração real será implementada após aprovação.');
    }, 2000);
  };

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => String(currentYear + i));

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
                src={diamondHotmart} 
                alt="Diamantes Free Fire" 
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground">Paquete de Diamantes – Free Fire</h3>
                <p className="text-muted-foreground">{selectedPackage.diamonds.toLocaleString()} + Bonus</p>
                <p className="text-destructive font-bold text-lg">
                  Total: $ {selectedPackage.priceUsd.toFixed(2)} USD
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted border-border"
                  required
                />
              </div>

              {/* Payment Method Selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-card text-foreground font-medium"
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>
              </div>

              {/* Card Details */}
              <div className="bg-muted rounded-xl p-4 space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Credit card number"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="h-12 bg-card border-border"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                    <SelectTrigger className="h-12 bg-card border-border">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={expiryYear} onValueChange={setExpiryYear}>
                    <SelectTrigger className="h-12 bg-card border-border">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="h-12 bg-card border-border"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Shield className="w-4 h-4" />
                <span>We protect your payment data with encryption to ensure bank-level security.</span>
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
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    PAY (${selectedPackage.priceUsd.toFixed(2)})
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

export default Checkout;
