import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PulseScore } from "@/components/PulseScore";
import { CycleChart } from "@/components/CycleChart";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCard } from "@/components/PricingCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { 
  TrendingUp, 
  BarChart3, 
  Bell, 
  Zap, 
  Shield, 
  Database,
  ArrowRight,
  ChevronDown,
  User,
  LogOut
} from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { createCheckoutSession } = useSubscriptionActions();

  const handleGetStarted = () => {
    if (user) {
      // User is logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // Redirect to auth page
      navigate('/auth');
    }
  };

  const handlePlanSelect = (planType: 'free' | 'pro' | 'enterprise') => {
    if (planType === 'free') {
      handleGetStarted();
    } else if (user) {
      createCheckoutSession(planType);
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold text-foreground">PulseCycle Pro</span>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        )}
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
              Advanced cycle analytics for PulseChain. Predict market peaks with 92% accuracy using ML-powered historical pattern recognition.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button variant="pro" size="lg" className="text-lg" onClick={handleGetStarted}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg">
                View Demo Dashboard
              </Button>
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

      {/* Pricing Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as your trading strategy evolves
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            title="Basic"
            price="Free"
            description="Perfect for getting started"
            features={[
              "3 coins tracking",
              "24h data history",
              "Basic PulseScore",
              "Community support"
            ]}
            ctaText="Get Started Free"
            onSelect={() => handlePlanSelect('free')}
          />
          
          <PricingCard
            title="Pro"
            price="$19.99"
            description="For serious traders"
            features={[
              "Unlimited coin tracking",
              "5 years historical data",
              "Advanced analytics",
              "5 alerts per day",
              "CSV/JSON exports",
              "Priority support"
            ]}
            popular
            ctaText="Start Pro Trial"
            onSelect={() => handlePlanSelect('pro')}
          />
          
          <PricingCard
            title="Enterprise"
            price="$499"
            description="For institutions"
            features={[
              "Full API access",
              "Custom ML models",
              "Unlimited alerts",
              "Webhook integrations",
              "24/7 SLA support",
              "Custom reporting"
            ]}
            ctaText="Contact Sales"
            onSelect={() => handlePlanSelect('enterprise')}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <Card className="p-12 text-center bg-gradient-glow border-primary/30">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Master PulseChain Cycles?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 5,000+ traders using PulseCycle Pro to time their entries and exits perfectly
          </p>
          <Button variant="pro" size="lg" className="text-lg" onClick={handleGetStarted}>
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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