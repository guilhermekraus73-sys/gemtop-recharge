import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Quiz from "./pages/Quiz";
import QuizStrip from "./pages/QuizStrip";
import GuiaDiamante from "./pages/GuiaDiamante";
import Identify from "./pages/Identify";
import IdPlayer from "./pages/IdPlayer";
import Recharge from "./pages/Recharge";
import RechargeStrip from "./pages/RechargeStrip";
import Checkout from "./pages/Checkout";
import Checkout9 from "./pages/Checkout9";
import Checkout15 from "./pages/Checkout15";
import Checkout19 from "./pages/Checkout19";
import ThankYou from "./pages/ThankYou";
import ThankYouBoleto from "./pages/ThankYouBoleto";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Quiz />} />
          <Route path="/guia-diamante" element={<GuiaDiamante />} />
          <Route path="/quiz-strip" element={<QuizStrip />} />
          <Route path="/identificar" element={<Identify />} />
          <Route path="/id-player" element={<IdPlayer />} />
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/recharge-strip" element={<RechargeStrip />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout9" element={<Checkout9 />} />
          <Route path="/checkout15" element={<Checkout15 />} />
          <Route path="/checkout19" element={<Checkout19 />} />
          <Route path="/obrigado" element={<ThankYou />} />
          <Route path="/obrigado-boleto" element={<ThankYouBoleto />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
