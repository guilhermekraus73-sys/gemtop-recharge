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
const PackagesSection = ({
  packages,
  selectedPackage,
  onSelectPackage
}: PackagesSectionProps) => {
  return <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="step-number bg-destructive">2</span>
        <span className="font-semibold text-foreground">Valor de Recarga</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {packages.map(pkg => (
          <div 
            key={pkg.id} 
            onClick={() => onSelectPackage(pkg.id)} 
            className={`package-card flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPackage === pkg.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <img src={diamondIcon} alt="Diamond" className="w-5 h-5" />
              <span className="font-bold text-lg text-foreground">{pkg.diamonds.toLocaleString()}</span>
            </div>
            <p className="text-base font-semibold text-primary">
              {pkg.currency} {pkg.price.toFixed(2)}
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">
              + Bônus {pkg.bonus.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">
        Tus créditos se acreditarán a tu cuenta de juego tan pronto como recibamos la confirmación del pago. [Para FF] Además de los diamantes de bonificación, también recibirás una bonificación del 20% en los artículos del juego.
      </p>
      
      <div className="info-box border-[#ff0000]">
        ¡El importe de la recarga se convertirá automáticamente a tu moneda local!
      </div>
    </div>;
};
export default PackagesSection;