import freefireCharacter from "@/assets/freefire-character.png";
const GameSelection = () => {
  return <div className="space-y-3">
      <h2 className="text-foreground font-semibold text-base">Selección de Juego</h2>
      
      <div className="game-card w-16 h-16 flex items-center justify-center">
        <img src={freefireCharacter} alt="Free Fire" className="w-12 h-12 object-cover" />
        
      </div>
    </div>;
};
export default GameSelection;