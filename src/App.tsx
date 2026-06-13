import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PulseInsight from "./pages/PulseInsight";
import Community from "./pages/Community";
import MemeCoins from "./pages/MemeCoins";
import TrustlessLocks from "./pages/TrustlessLocks";
import EmbedPage from "./pages/EmbedPage";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import { WalletProvider } from "./contexts/WalletContext";

const queryClient = new QueryClient();

const App = () => (
  <WalletProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pulse-insight" element={<PulseInsight />} />
            <Route path="/community" element={<Community />} />
            <Route path="/meme-coins" element={<MemeCoins />} />
            <Route path="/trustless-locks" element={<TrustlessLocks />} />
            <Route path="/embed" element={<EmbedPage />} />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WalletProvider>
);

export default App;
