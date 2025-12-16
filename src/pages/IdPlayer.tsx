import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const membershipsBanner = "https://recargasdiamante.site/assets/memberships-banner-new-CLtuAl-k.jpg";
const garenaLogo = "https://recargasdiamante.site/assets/garena-logo-new-BpIrME3Z.png";
const freefireIcon = "https://recargasdiamante.site/assets/freefire-icon-B-2fWEW9.png";
const diamondIcon = "https://recargasdiamante.site/assets/diamond-icon-DfkGj-iT.png";

const IdPlayer: React.FC = () => {
  const [playerId, setPlayerId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleValidate = () => {
    if (!playerId.trim()) {
      alert("Por favor, introduce el ID del jugador.");
      return;
    }
    navigate("/recharge-strip" + location.search);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="header-white py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src={garenaLogo} alt="Garena" className="h-8" />
          <span className="font-semibold text-lg text-foreground">Centro Oficial de Recargas</span>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        {/* Banner */}
        <div className="rounded-xl overflow-hidden mb-6">
          <img src={membershipsBanner} alt="Memberships" className="w-full h-auto" />
        </div>

        {/* Game Selection */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Selección de Juego</h2>

          {/* Mini selected card */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary">
              <img src={freefireIcon} alt="Free Fire" className="w-5 h-5" />
              <span className="text-sm font-medium text-foreground">Free Fire</span>
            </div>
          </div>

          {/* Main game card */}
          <div className="game-card game-card-selected">
            <div className="flex items-center gap-3 p-4">
              <img src={freefireIcon} alt="Free Fire" className="w-16 h-16 rounded-lg" />
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Free Fire</h3>
                <p className="text-xs text-muted-foreground">© Pagamento 100% Seguro</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Step 1 - Enter ID */}
        <section className="info-box mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="step-number">1</div>
            <span className="font-semibold text-foreground">Ingresar</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">ID de jugador</label>
              <span className="text-muted-foreground cursor-help">ⓘ</span>
            </div>
            <input
              type="text"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              placeholder="Introduce el ID del jugador."
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={handleValidate}
            className="w-full py-3 rounded-xl font-semibold btn-primary-gradient"
          >
            Iniciar
          </button>
        </section>

        {/* Promo Info Box */}
        <section className="info-box bg-primary/5 border-primary/20">
          <div className="flex gap-3">
            <img src={diamondIcon} alt="Diamond" className="w-12 h-12" />
            <div className="flex-1">
              <p className="text-sm text-foreground mb-1">
                ¡Inicia sesión con tu ID para ver las recargas disponibles y canjear tu bono!
              </p>
              <p className="text-sm font-semibold text-primary">
                ¡Recarga de aniversario desbloqueada con hasta un 70% de descuento + 20% de bonificación!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-garena-dark py-6 px-4 mt-auto">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs text-primary-foreground/60 mb-3">
            © Garena Online. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Preguntas frecuentes
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Términos y condiciones
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Política de privacidad
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IdPlayer;
