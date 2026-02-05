import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Quiz from "./pages/Quiz";
import QuizStrip from "./pages/QuizStrip";
import QuizStripEn from "./pages/QuizStripEn";
import GuiaDiamante from "./pages/GuiaDiamante";
import Identify from "./pages/Identify";
import IdPlayer from "./pages/IdPlayer";
import IdPlayerEn from "./pages/IdPlayerEn";
import Recharge from "./pages/Recharge";
import RechargeStrip from "./pages/RechargeStrip";
import RechargeStripEn from "./pages/RechargeStripEn";
import Checkout from "./pages/Checkout";
import Checkout1 from "./pages/Checkout1";
import Checkout9 from "./pages/Checkout9";
import Checkout9En from "./pages/Checkout9En";
import Checkout15 from "./pages/Checkout15";
import Checkout15En from "./pages/Checkout15En";
import Checkout19 from "./pages/Checkout19";
import Checkout19En from "./pages/Checkout19En";
import ThankYou from "./pages/ThankYou";
import ThankYouBoleto from "./pages/ThankYouBoleto";
import TestFunnel from "./pages/TestFunnel";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
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
          <Route path="/quiz-strip-en" element={<QuizStripEn />} />
          <Route path="/identificar" element={<Identify />} />
          <Route path="/id-player" element={<IdPlayer />} />
          <Route path="/id-player-en" element={<IdPlayerEn />} />
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/recharge-strip" element={<RechargeStrip />} />
          <Route path="/recharge-strip-en" element={<RechargeStripEn />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout1" element={<Checkout1 />} />
          <Route path="/checkout9" element={<Checkout9 />} />
          <Route path="/checkout9-en" element={<Checkout9En />} />
          <Route path="/checkout15" element={<Checkout15 />} />
          <Route path="/checkout15-en" element={<Checkout15En />} />
          <Route path="/checkout19" element={<Checkout19 />} />
          <Route path="/checkout19-en" element={<Checkout19En />} />
          <Route path="/obrigado" element={<ThankYou />} />
          <Route path="/obrigado-boleto" element={<ThankYouBoleto />} />
          <Route path="/test-funnel" element={<TestFunnel />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
