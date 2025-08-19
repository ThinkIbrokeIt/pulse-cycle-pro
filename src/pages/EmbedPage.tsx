import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Code, 
  Copy, 
  Home,
  Palette,
  Monitor,
  Smartphone
} from 'lucide-react';
import EmbedWidget from '@/components/EmbedWidget';

const EmbedPage = () => {
  const [selectedToken, setSelectedToken] = useState('PLS');
  const [widgetSize, setWidgetSize] = useState<'compact' | 'full'>('full');

  const mockTokens = [
    {
      symbol: 'PLS',
      name: 'PulseChain',
      pulseScore: 87,
      currentPhase: 'Accumulation' as const,
      nextPeak: '2024-03-15',
      confidence: 89
    },
    {
      symbol: 'PLSX',
      name: 'PulseX',
      pulseScore: 92,
      currentPhase: 'Uptrend' as const,
      nextPeak: '2024-02-28',
      confidence: 94
    },
    {
      symbol: 'INC',
      name: 'Incentive',
      pulseScore: 65,
      currentPhase: 'Distribution' as const,
      nextPeak: '2024-04-10',
      confidence: 71
    },
    {
      symbol: 'HEX',
      name: 'HEX',
      pulseScore: 34,
      currentPhase: 'Downtrend' as const,
      nextPeak: '2024-05-20',
      confidence: 62
    }
  ];

  const selectedTokenData = mockTokens.find(t => t.symbol === selectedToken) || mockTokens[0];

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed?token=${selectedToken}&size=${widgetSize}`;
    
    return `<!-- PulseCycle Pro Widget -->
<iframe 
  src="${embedUrl}"
  width="${widgetSize === 'compact' ? '280' : '320'}" 
  height="${widgetSize === 'compact' ? '120' : '200'}"
  frameborder="0" 
  style="border-radius: 12px; overflow: hidden;"
  title="PulseCycle Pro - ${selectedTokenData.name} Analysis">
</iframe>`;
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      toast.success('Embed code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy embed code:', error);
      toast.error('Failed to copy embed code. Please try again.');
    }
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
          <Link to="/pulse-insight">
            <Button variant="outline" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Pulse Insight
            </Button>
          </Link>
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Embed Widget</h1>
            <p className="text-muted-foreground">Add PulseCycle Pro widgets to your website</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            <Card className="p-6 bg-card border-card-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Widget Configuration</h2>
              
              {/* Token Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Token
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mockTokens.map((token) => (
                    <Button
                      key={token.symbol}
                      variant={selectedToken === token.symbol ? "default" : "outline"}
                      onClick={() => setSelectedToken(token.symbol)}
                      className="justify-start"
                    >
                      {token.symbol}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Widget Size
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={widgetSize === 'compact' ? "default" : "outline"}
                    onClick={() => setWidgetSize('compact')}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Compact
                  </Button>
                  <Button
                    variant={widgetSize === 'full' ? "default" : "outline"}
                    onClick={() => setWidgetSize('full')}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    Full
                  </Button>
                </div>
              </div>
            </Card>

            {/* Embed Code */}
            <Card className="p-6 bg-gradient-glow border-primary/30">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Embed Code</h2>
              </div>
              
              <Textarea
                value={generateEmbedCode()}
                readOnly
                className="font-mono text-sm bg-card/50 border-card-border mb-4"
                rows={8}
              />
              
              <Button onClick={copyEmbedCode} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
            </Card>

            {/* Usage Instructions */}
            <Card className="p-6 bg-card border-card-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">How to Use</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <div>Configure your widget settings above</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <div>Copy the generated embed code</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <div>Paste it into your website's HTML where you want the widget to appear</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                  <div>The widget will automatically update with live data</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="p-6 bg-card border-card-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Live Preview</h2>
              
              <div className="flex justify-center">
                <EmbedWidget 
                  {...selectedTokenData}
                  compact={widgetSize === 'compact'}
                />
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6 bg-card border-card-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Widget Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Real-time PulseScore updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Current cycle phase indicators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Peak prediction confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Direct link to detailed analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Mobile responsive design</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Matches your site's dark/light theme</span>
                </div>
              </div>
            </Card>

            {/* Customization Note */}
            <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-yellow-400">Need Custom Styling?</h3>
              </div>
              <p className="text-sm text-yellow-200">
                Contact us for custom widget designs, additional tokens, or white-label solutions 
                that match your brand perfectly.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedPage;