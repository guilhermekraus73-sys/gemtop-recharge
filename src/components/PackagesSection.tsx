import diamondIcon from "@/assets/diamond-icon.png";

interface Package {
  id: number;
  diamonds: number;
  price: number;
  bonus: number;
  currency: string;
}

interface PackagesSectionProps {
  packages: Package[];
  selectedPackage: number | null;
  onSelectPackage: (id: number) => void;
}

const PackagesSection = ({ packages, selectedPackage, onSelectPackage }: PackagesSectionProps) => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="step-number">2</span>
        <span className="font-semibold text-foreground">Valor de Recarga</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg.id)}
            className={`package-card text-center ${selectedPackage === pkg.id ? 'selected' : ''}`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <img src={diamondIcon} alt="Diamond" className="w-4 h-4" />
              <span className="font-bold text-foreground">{pkg.diamonds.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {pkg.currency} {pkg.price.toFixed(2)}
            </p>
            <p className="text-xs bonus-text font-medium">
              + Bônus {pkg.bonus.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">
        Tus créditos se acreditarán a tu cuenta de juego tan pronto como recibamos la confirmación del pago. [Para FF] Además de los diamantes de bonificación, también recibirás una bonificación del 20% en los artículos del juego.
      </p>
      
      <div className="info-box">
        ¡El importe de la recarga se convertirá automáticamente a tu moneda local!
      </div>
    </div>
  );
};

export default PackagesSection;
