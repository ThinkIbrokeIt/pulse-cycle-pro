import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PulseScore } from "@/components/PulseScore";
import { CycleChart } from "@/components/CycleChart";
import { FeatureCard } from "@/components/FeatureCard";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  BarChart3, 
  Bell, 
  Zap, 
  Shield, 
  Database,
  ChevronDown,
  Search,
  Navigation,
  Code,
  Users
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <TrendingUp className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold text-foreground">PulseCycle Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/embed">
            <Button variant="ghost" className="hidden md:flex items-center gap-2">
              <Code className="h-4 w-4" />
              Embed
            </Button>
          </Link>
          <Link to="/community">
            <Button variant="ghost" className="hidden md:flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </Button>
          </Link>
          <Link to="/pulse-insight">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Pulse Insight
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-20"></div>
        <div className="container mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="bg-gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium animate-pulse-glow">
                ⚡ AI-Powered Cycle Predictions
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PulseCycle Pro
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
              Advanced cycle analytics for PulseChain. Predict market peaks with 92% accuracy using ML-powered historical pattern recognition. Completely free for the community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/pulse-insight">
                <Button variant="pro" size="lg" className="text-lg">
                  Start Using PulseCycle Pro
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline" size="lg" className="text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Join Community
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 text-center">
              <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Real-Time Analytics Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor cycle phases, track predictions, and get alerts for optimal entry/exit points
          </p>
        </div>
        
        {/* PulseScore Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <PulseScore score={87} symbol="PLS" change24h={12.4} phase="Accumulation" />
          <PulseScore score={92} symbol="PLSX" change24h={8.7} phase="Uptrend" />
          <PulseScore score={65} symbol="INC" change24h={-3.2} phase="Distribution" />
          <PulseScore score={34} symbol="HEX" change24h={-8.9} phase="Downtrend" />
        </div>
        
        {/* Main Chart */}
        <CycleChart />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Advanced Cycle Intelligence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powered by 5+ years of historical data and cutting-edge ML algorithms
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="PulseScore™ Algorithm"
            description="Proprietary scoring system that analyzes 50+ metrics to predict cycle phases with 92% accuracy"
            highlight
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Historical Pattern Matching"
            description="Compare current cycles with historical data dating back to PulseChain genesis"
          />
          <FeatureCard
            icon={<Bell className="h-8 w-8" />}
            title="Smart Alerts"
            description="Real-time notifications for phase transitions, whale movements, and prediction updates"
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Real-Time Processing"
            description="Live blockchain data integration with sub-second latency for instant insights"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Enterprise Security"
            description="SOC 2 Type II compliant with encrypted data storage and secure API access"
          />
          <FeatureCard
            icon={<Database className="h-8 w-8" />}
            title="API Access"
            description="Full REST API for custom integrations and automated trading strategies"
          />
        </div>
      </div>

      {/* Community Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Free for the Community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PulseCycle Pro is completely free to help the PulseChain community make better trading decisions
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-glow border-primary/30">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">All Features Included</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Unlimited coin tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">5 years historical data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Advanced PulseScore™ analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Real-time alerts</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">CSV/JSON data exports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">API access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">Community support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">No limits, no restrictions</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <Card className="p-12 text-center bg-gradient-glow border-primary/30">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Master PulseChain Cycles?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders using PulseCycle Pro to time their entries and exits perfectly - completely free!
          </p>
          <Link to="/pulse-insight">
            <Button variant="pro" size="lg" className="text-lg">
              Access PulseCycle Pro Now
            </Button>
          </Link>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-card-border">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">© 2024 PulseCycle Pro. All rights reserved.</p>
            <p className="text-sm">
              Advanced analytics for PulseChain • Built with precision • Powered by AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;