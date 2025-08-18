import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Link, useSearchParams } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  DollarSign,
  BarChart3,
  Share2,
  Download,
  Zap,
  Target,
  Brain,
  Home
} from 'lucide-react';
import { CycleChart } from '@/components/CycleChart';

interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  pulseScore: number;
  currentPhase: 'Accumulation' | 'Uptrend' | 'Distribution' | 'Downtrend';
  nextPeak: string;
  confidence: number;
  aiInsight: string;
}

const PulseInsight = () => {
  const [searchParams] = useSearchParams();
  const { track } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Check for token parameter in URL
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setSearchQuery(tokenParam);
      searchCoin(tokenParam);
    }
  }, [searchParams]);

  // Mock PulseChain tokens data
  const mockTokens: CoinData[] = [
    {
      symbol: 'PLS',
      name: 'PulseChain',
      price: 0.0000891,
      change24h: 12.4,
      volume24h: 4567890,
      marketCap: 5234567890,
      pulseScore: 87,
      currentPhase: 'Accumulation',
      nextPeak: '2024-03-15',
      confidence: 89,
      aiInsight: 'Strong accumulation pattern detected. Whale activity increasing. Historical data suggests 40-60% upside potential.'
    },
    {
      symbol: 'PLSX',
      name: 'PulseX',
      price: 0.000156,
      change24h: 8.7,
      volume24h: 3456789,
      marketCap: 3456789012,
      pulseScore: 92,
      currentPhase: 'Uptrend',
      nextPeak: '2024-02-28',
      confidence: 94,
      aiInsight: 'Momentum accelerating. RSI levels optimal. Pattern matches 2023 Q4 rally with 85% accuracy.'
    },
    {
      symbol: 'INC',
      name: 'Incentive',
      price: 0.00234,
      change24h: -3.2,
      volume24h: 1234567,
      marketCap: 987654321,
      pulseScore: 65,
      currentPhase: 'Distribution',
      nextPeak: '2024-04-10',
      confidence: 71,
      aiInsight: 'Distribution phase active. Volume declining. Consider dollar-cost averaging strategy.'
    },
    {
      symbol: 'HEX',
      name: 'HEX',
      price: 0.00456,
      change24h: -8.9,
      volume24h: 2345678,
      marketCap: 1876543210,
      pulseScore: 34,
      currentPhase: 'Downtrend',
      nextPeak: '2024-05-20',
      confidence: 62,
      aiInsight: 'Oversold conditions emerging. Support level at $0.004. Recovery pattern expected in 4-6 weeks.'
    }
  ];

  const searchCoin = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    track('token_search', { token: query.trim() });
    
    // Simulate API call
    setTimeout(() => {
      const found = mockTokens.find(token => 
        token.symbol.toLowerCase().includes(query.toLowerCase()) ||
        token.name.toLowerCase().includes(query.toLowerCase())
      );
      
      if (found) {
        setSelectedCoin(found);
        generateAIInsight(found);
        track('token_selected', { 
          token: found.symbol, 
          name: found.name,
          pulseScore: found.pulseScore,
          phase: found.currentPhase 
        });
      } else {
        toast.error(`Token "${query}" not found in PulseChain ecosystem`);
        track('token_not_found', { query: query.trim() });
      }
      setLoading(false);
    }, 1000);
  };

  const generateAIInsight = async (coin: CoinData) => {
    setAiLoading(true);
    
    // Simulate AI insight generation with Deepseek
    setTimeout(() => {
      setAiLoading(false);
      toast.success('AI insight updated with latest data');
    }, 2000);
  };

  const handleShare = () => {
    if (selectedCoin) {
      const shareUrl = `${window.location.origin}/pulse-insight?token=${selectedCoin.symbol}`;
      const shareText = `Check out ${selectedCoin.name} (${selectedCoin.symbol}) analysis on PulseCycle Pro: PulseScore ${selectedCoin.pulseScore}, ${selectedCoin.currentPhase} phase. AI predicts ${selectedCoin.confidence}% confidence for next peak on ${selectedCoin.nextPeak}. ${shareUrl}`;
      
      navigator.clipboard.writeText(shareText);
      toast.success('Analysis link copied to clipboard');
      
      track('token_shared', { 
        token: selectedCoin.symbol,
        method: 'clipboard'
      });
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Accumulation': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'Uptrend': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'Distribution': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'Downtrend': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-card-border">
        <Link to="/" className="flex items-center">
          <TrendingUp className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold text-foreground">PulseCycle Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-card-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Pulse Insight</h1>
              <p className="text-muted-foreground">Advanced analytics for PulseChain tokens</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <Card className="p-6 mb-8 bg-gradient-glow border-primary/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search PulseChain tokens (PLS, PLSX, INC, HEX...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchCoin(searchQuery)}
                  className="pl-10 bg-card/50 border-card-border"
                />
              </div>
            </div>
            <Button 
              onClick={() => searchCoin(searchQuery)}
              disabled={loading || !searchQuery.trim()}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Quick Access Tokens */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Popular PulseChain Tokens</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockTokens.map((token) => (
              <Card 
                key={token.symbol}
                className="p-4 cursor-pointer hover:bg-card-elevated transition-colors border-card-border"
                onClick={() => {
                  setSelectedCoin(token);
                  setSearchQuery(token.symbol);
                  generateAIInsight(token);
                }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{token.symbol}</div>
                  <div className="text-sm text-muted-foreground">{token.name}</div>
                  <div className="text-xs mt-2">
                    <Badge className={`text-xs ${getPhaseColor(token.currentPhase)}`}>
                      {token.currentPhase}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Analysis Results */}
        {selectedCoin && (
          <div className="space-y-8">
            {/* Token Overview */}
            <Card className="p-6 bg-card border-card-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedCoin.name}</h2>
                    <p className="text-muted-foreground">{selectedCoin.symbol}</p>
                  </div>
                  <Badge className={`${getPhaseColor(selectedCoin.currentPhase)}`}>
                    {selectedCoin.currentPhase}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Price</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">${formatPrice(selectedCoin.price)}</div>
                  <div className={`text-sm ${selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h.toFixed(2)}%
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">PulseScore</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">{selectedCoin.pulseScore}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCoin.pulseScore >= 80 ? 'Excellent' : selectedCoin.pulseScore >= 60 ? 'Good' : selectedCoin.pulseScore >= 40 ? 'Fair' : 'Poor'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Volume 24h</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">{formatNumber(selectedCoin.volume24h)}</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Confidence</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">{selectedCoin.confidence}%</div>
                  <div className="text-sm text-muted-foreground">Next Peak: {selectedCoin.nextPeak}</div>
                </div>
              </div>
            </Card>

            {/* AI Insight */}
            <Card className="p-6 bg-gradient-glow border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">AI Insight</h3>
                  <p className="text-sm text-muted-foreground">Powered by Deepseek R1</p>
                </div>
                {aiLoading && (
                  <Badge variant="outline" className="ml-auto">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </Badge>
                )}
              </div>
              
              {aiLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <p className="text-foreground leading-relaxed">{selectedCoin.aiInsight}</p>
              )}
            </Card>

            {/* Chart */}
            <Card className="p-6 bg-card border-card-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Cycle Analysis</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/30">
                    <Calendar className="h-3 w-3 mr-1" />
                    Cycle Start: Jan 15
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Peak Target: {selectedCoin.nextPeak}
                  </Badge>
                </div>
              </div>
              <CycleChart />
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!selectedCoin && (
          <Card className="p-12 text-center bg-card/50 border-card-border">
            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Search for a Token</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a PulseChain token symbol or name above to get detailed cycle analysis, 
              AI insights, and price predictions.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PulseInsight;