import { Shield } from "lucide-react";
import charactersBanner from "@/assets/characters-banner.jpg";
import freefireCharacter from "@/assets/freefire-character.png";
const HeroBanner = () => {
  return <div className="hero-banner h-32 flex items-end p-4" style={{
    backgroundImage: `url(${charactersBanner})`
  }}>
      <div className="flex items-center gap-3">
        <div className="game-card w-14 h-14 flex items-center justify-center bg-card/90 gap-0 pr-0 pb-0 py-0 px-0 my-0 mx-0">
          <img src={freefireCharacter} alt="Free Fire" className="w-10 h-10 object-cover" />
          
        </div>
        
        <div className="text-white">
          <h3 className="font-bold text-lg drop-shadow-lg">Free Fire</h3>
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="drop-shadow-md">Pagamento 100% Seguro</span>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroBanner;