import { useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import MembershipsBanner from "@/components/MembershipsBanner";
import GameSelection from "@/components/GameSelection";
import HeroBanner from "@/components/HeroBanner";
import AccountSection from "@/components/AccountSection";
import PackagesSection from "@/components/PackagesSection";
import PaymentSection from "@/components/PaymentSection";
import ContinueButton from "@/components/ContinueButton";
const packages = [{
  id: 1,
  diamonds: 5600,
  price: 9.00,
  bonus: 1120,
  currency: "US$"
}, {
  id: 2,
  diamonds: 11200,
  price: 15.90,
  bonus: 2240,
  currency: "US$"
}, {
  id: 3,
  diamonds: 22400,
  price: 19.00,
  bonus: 4480,
  currency: "US$"
}];
const Index = () => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [playerId, setPlayerId] = useState("");
  const handleContinue = () => {
    if (!playerId.trim()) {
      toast.error("Por favor, informe o ID do jogador");
      return;
    }
    if (!selectedPackage) {
      toast.error("Por favor, selecione um pacote de diamantes");
      return;
    }
    toast.success("Processando pagamento...");
  };
  const selectedPack = packages.find(p => p.id === selectedPackage);
  return <div className="min-h-screen bg-background">
      <Header className="bg-primary-foreground border-primary-foreground" />
      
      <main className="container py-4 space-y-6">
        <MembershipsBanner />
        <GameSelection />
        <HeroBanner />
        
        <div className="space-y-6">
          <AccountSection playerId={playerId} onPlayerIdChange={setPlayerId} />
          
          <PackagesSection packages={packages} selectedPackage={selectedPackage} onSelectPackage={setSelectedPackage} />
          
          <PaymentSection selectedPayment={selectedPayment} onSelectPayment={setSelectedPayment} />
          
          <ContinueButton onClick={handleContinue} className="border-destructive bg-destructive" />
          
          {selectedPack && <div className="text-center py-4">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-foreground">
                {selectedPack.currency} {selectedPack.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground"> por </span>
              <span className="font-bold text-primary">
                {(selectedPack.diamonds + selectedPack.bonus).toLocaleString()} diamantes
              </span>
            </div>}
        </div>
      </main>
    </div>;
};
export default Index;