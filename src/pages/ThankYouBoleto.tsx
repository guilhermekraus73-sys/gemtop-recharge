import { CheckCircle, Diamond, Clock, Shield } from "lucide-react";

const freefireLogo = "https://recargasdiamante.site/assets/freefire-logo-khkzMQoZ.png";

const ThankYouBoleto = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6">
      {/* Logo */}
      <img
        src={freefireLogo}
        alt="Free Fire Logo"
        className="w-32 md:w-40 mb-6"
      />

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 md:p-7 shadow-xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-primary/20 border border-primary text-primary font-semibold mb-4">
          <Diamond className="w-3.5 h-3.5" />
          <span>Pedido registrado – Esperando pago</span>
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          ¡Boleto generado con éxito!
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          Ahora solo tienes que realizar el pago para liberar tus Diamantes 💎
        </p>

        {/* Section 1 - ¿Qué pasa ahora? */}
        <section className="mb-4">
          <div className="info-box">
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
              <span className="step-number">1</span>
              ¿Qué pasa ahora?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Tu pedido fue registrado con éxito, pero <span className="text-primary font-semibold">los Diamantes solo serán enviados después del pago del boleto</span>.
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed mt-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span><strong>Importante:</strong> cuanto más tardes en pagar, más tiempo tardará en comenzar el plazo de liberación de los Diamantes.</span>
            </p>
          </div>
        </section>

        {/* Section 2 - Paga tu boleto */}
        <section className="mb-4">
          <div className="info-box bg-primary/5 border-primary/20">
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
              <span className="step-number">2</span>
              Paga tu boleto lo antes posible
            </h2>
            <p className="text-sm text-foreground/90 mb-2">Para recibir tus Diamantes lo más rápido posible, realiza el pago del boleto generado por el método que prefieras.</p>
            <p className="text-xs text-muted-foreground mt-3">
              En cuanto se confirme el pago, comenzamos el proceso de recarga en tu cuenta.
            </p>
          </div>
        </section>

        {/* Section 3 - Plazo */}
        <section className="mb-4">
          <div className="info-box">
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
              <span className="step-number">3</span>
              <Clock className="w-4 h-4" />
              Plazo para liberación de los Diamantes
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed mb-3">
              <strong>🕒 Compensación del boleto:</strong><br />
              Generalmente toma <span className="text-primary font-semibold">hasta 1 día hábil</span> para confirmar el pago del boleto (en algunos casos puede ser antes).
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Después de la compensación, comenzamos el proceso de recarga dentro del plazo informado en la página de compra.
            </p>
            <p className="text-sm text-primary font-semibold mt-3">
              Resumen: cuanto antes pagues, más rápido comienza a contar el plazo para que los Diamantes lleguen a tu cuenta.
            </p>
          </div>
        </section>

        {/* Section 4 - Seguridad */}
        <section className="mb-4">
          <div className="info-box">
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
              <span className="step-number">4</span>
              <Shield className="w-4 h-4" />
              Seguridad de tu pedido
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed">
              🔒 Tu pedido está <strong>guardado y registrado</strong> en nuestro sistema.<br />
              Los Diamantes serán enviados únicamente a la <strong>cuenta de juego que proporcionaste</strong> al momento de la compra.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Guarda el <strong>comprobante de pago</strong> hasta que la recarga sea completada.
            </p>
          </div>
        </section>

        {/* Section 5 - Siguiente paso */}
        <section className="text-center border-t border-border/50 pt-5 mt-5">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            <Diamond className="w-4 h-4 text-primary" />
            Siguiente paso
          </h2>
          <div className="space-y-2 text-sm text-foreground/90 mb-4">
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Realiza el pago del boleto generado
            </p>
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Espera la confirmación del pago
            </p>
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Recibe tus Diamantes 💎
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center mt-4 pt-4 border-t border-dashed border-border/50">
          <p className="text-sm text-foreground">
            <strong className="text-primary">🧡 ¡Gracias por tu compra!</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Estamos listos para enviar tus Diamantes en cuanto se confirme el pago.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouBoleto;
