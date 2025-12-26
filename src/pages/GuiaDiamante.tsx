import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Shield, Star, Zap, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import diamondIcon from "@/assets/diamond-icon.png";

const GuiaDiamante = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "9",
      name: "Básico",
      price: "$9.00",
      diamonds: "5,600",
      features: [
        "Guía completa de diamantes",
        "Estrategias básicas",
        "Acceso inmediato"
      ],
      popular: false
    },
    {
      id: "15",
      name: "Avanzado",
      price: "$15.90",
      diamonds: "11,200",
      features: [
        "Todo del plan Básico",
        "Estrategias avanzadas",
        "Trucos exclusivos",
        "Soporte prioritario"
      ],
      popular: true
    },
    {
      id: "19",
      name: "Premium",
      price: "$19.00",
      diamonds: "22,400",
      features: [
        "Todo del plan Avanzado",
        "Métodos VIP",
        "Actualizaciones de por vida",
        "Comunidad exclusiva",
        "Bonus especiales"
      ],
      popular: false
    }
  ];

  const handleBuy = (planId: string) => {
    navigate(`/checkout${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] text-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src={diamondIcon} 
                alt="Diamante Free Fire" 
                className="w-32 h-32 object-contain animate-pulse"
              />
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full text-sm">
                GUÍA
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Guía de Diamantes Free Fire
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Descubre los mejores métodos para obtener diamantes y dominar el juego como un profesional
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Shield className="w-5 h-5 text-green-400" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Acceso Inmediato</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-orange-400" />
              <span>+10,000 Usuarios</span>
            </div>
          </div>
        </div>
      </section>

      {/* What is the Guide Section */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-yellow-400">
            ¿Qué es la Guía de Diamantes?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <BookOpen className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Contenido Exclusivo</h3>
              <p className="text-gray-300">
                Nuestra guía contiene estrategias probadas, trucos y métodos que te ayudarán a maximizar 
                tus diamantes en Free Fire. Aprende de los mejores jugadores y domina el juego.
              </p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <Award className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Resultados Garantizados</h3>
              <p className="text-gray-300">
                Miles de jugadores ya han mejorado su experiencia con nuestra guía. Obtén acceso a 
                información privilegiada y lleva tu juego al siguiente nivel.
              </p>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl border border-yellow-500/30">
            <h3 className="text-xl font-bold mb-4 text-center">Lo que incluye:</h3>
            <ul className="grid md:grid-cols-2 gap-3">
              {[
                "Métodos para obtener diamantes gratis",
                "Estrategias de eventos especiales",
                "Trucos para maximizar recompensas",
                "Guía de inversión inteligente",
                "Calendario de eventos actualizado",
                "Comunidad de jugadores VIP"
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Elige tu Plan
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bold px-4 py-1 rounded-full text-sm">
                    MÁS POPULAR
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{plan.price}</div>
                  <div className="text-sm text-gray-400">Valor en diamantes: {plan.diamonds}</div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleBuy(plan.id)}
                  className={`w-full py-6 text-lg font-bold transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Comprar Ahora
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400">10K+</div>
              <div className="text-sm text-gray-400">Usuarios Activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">100%</div>
              <div className="text-sm text-gray-400">Seguro</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">24/7</div>
              <div className="text-sm text-gray-400">Soporte</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">5⭐</div>
              <div className="text-sm text-gray-400">Calificación</div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Section - Stripe Compliant */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-400">
          <h3 className="text-lg font-bold text-white mb-6">Políticas y Términos</h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-2">Política de Reembolso</h4>
              <p className="text-xs">
                Debido a la naturaleza digital de este producto, todas las ventas son finales. 
                No se ofrecen reembolsos una vez que se ha entregado el acceso al contenido digital. 
                Si experimenta problemas técnicos, contáctenos dentro de las 24 horas.
              </p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-2">Términos de Servicio</h4>
              <p className="text-xs">
                Al realizar una compra, usted acepta nuestros términos de servicio. 
                Este es un producto de información digital. El contenido es para uso personal 
                y no puede ser redistribuido o revendido.
              </p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-2">Privacidad</h4>
              <p className="text-xs">
                Su información personal está protegida. Utilizamos Stripe para procesar pagos 
                de forma segura. No almacenamos datos de tarjetas de crédito en nuestros servidores.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-yellow-400 font-semibold">
              📧 Soporte:{" "}
              <a href="mailto:udirapha@hotmail.com" className="hover:underline">
                udirapha@hotmail.com
              </a>
            </p>
            <p>
              <strong>Aviso Legal:</strong> Este producto es una guía informativa. 
              Free Fire es una marca registrada de Garena. No estamos afiliados con Garena.
            </p>
            <p>
              Los pagos son procesados de forma segura a través de{" "}
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Stripe
              </a>
              . Todos los precios están en dólares estadounidenses (USD).
            </p>
            <p className="mt-4">
              © {new Date().getFullYear()} Guía de Diamantes. Todos los derechos reservados.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-8 opacity-50" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuiaDiamante;
