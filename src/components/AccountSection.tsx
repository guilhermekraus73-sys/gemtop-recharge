import freefireCharacter from "@/assets/freefire-character.png";
interface AccountSectionProps {
  playerId: string;
  onPlayerIdChange: (value: string) => void;
}
const AccountSection = ({
  playerId,
  onPlayerIdChange
}: AccountSectionProps) => {
  return <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="step-number bg-destructive">1</span>
        <span className="font-semibold text-foreground">Cuenta</span>
      </div>
      
      <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
        <img src={freefireCharacter} alt="Player" className="w-10 h-10 object-contain" />
        <div className="flex-1">
          <input type="text" value={playerId} onChange={e => onPlayerIdChange(e.target.value)} placeholder="Jugador identificado" className="w-full bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground" />
          <p className="text-xs discount-text font-medium mt-0.5">
            Desbloqueado 70% de descuento
          </p>
        </div>
      </div>
    </div>;
};
export default AccountSection;