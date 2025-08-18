import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  Eye, 
  Calendar,
  Wallet,
  Users,
  Target,
  Clock,
  DollarSign,
  Skull
} from 'lucide-react';

interface RuggedCoin {
  id: string;
  name: string;
  symbol: string;
  launchDate: string;
  rugDate: string;
  tradingDuration: string;
  launcherWallet: string;
  colludingWallets: string[];
  tactics: string[];
  totalLoss: number;
  victimCount: number;
  rugType: 'liquidity_pull' | 'honeypot' | 'mint_exploit' | 'fake_team';
}

interface MemeToken {
  id: string;
  name: string;
  symbol: string;
  address: string;
  launchDate: string;
  riskScore: number;
  marketCap: number;
  liquidityLocked: boolean;
  contractVerified: boolean;
  teamDoxxed: boolean;
  status: 'active' | 'warning' | 'rugged';
}

const MOCK_RUGGED_COINS: RuggedCoin[] = [
  {
    id: '1',
    name: 'PulseDoge',
    symbol: 'PDOGE',
    launchDate: '2024-08-10',
    rugDate: '2024-08-14',
    tradingDuration: '4 days',
    launcherWallet: '0x1234...5678',
    colludingWallets: ['0xabcd...efgh', '0x9876...5432'],
    tactics: ['Initial pump with bots', 'Fake partnerships announced', 'Liquidity slowly drained'],
    totalLoss: 125000,
    victimCount: 847,
    rugType: 'liquidity_pull'
  },
  {
    id: '2',
    name: 'MoonPulse',
    symbol: 'MPLS',
    launchDate: '2024-08-12',
    rugDate: '2024-08-13',
    tradingDuration: '1 day',
    launcherWallet: '0x2468...1357',
    colludingWallets: ['0xfedc...ba98'],
    tactics: ['Honeypot contract', 'Fake audit report', 'Celebrity endorsement scam'],
    totalLoss: 89000,
    victimCount: 523,
    rugType: 'honeypot'
  }
];

const MOCK_MEME_TOKENS: MemeToken[] = [
  {
    id: '1',
    name: 'PulseShiba',
    symbol: 'PSHIB',
    address: '0xabc123...def456',
    launchDate: '2024-08-15',
    riskScore: 25,
    marketCap: 450000,
    liquidityLocked: true,
    contractVerified: true,
    teamDoxxed: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'ChainMeme',
    symbol: 'CMEME',
    address: '0x789xyz...123abc',
    launchDate: '2024-08-16',
    riskScore: 75,
    marketCap: 125000,
    liquidityLocked: false,
    contractVerified: false,
    teamDoxxed: false,
    status: 'warning'
  }
];

export default function MemeCoins() {
  const [daysSinceLastRug, setDaysSinceLastRug] = useState(4);
  const [selectedRuggedCoin, setSelectedRuggedCoin] = useState<RuggedCoin | null>(null);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRugTypeColor = (type: string) => {
    switch (type) {
      case 'liquidity_pull': return 'bg-red-100 text-red-800';
      case 'honeypot': return 'bg-orange-100 text-orange-800';
      case 'mint_exploit': return 'bg-purple-100 text-purple-800';
      case 'fake_team': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Rug Counter */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">PulseChain Meme Coin Security</h1>
            <p className="text-muted-foreground">Protecting our community from rug pulls and scams</p>
          </div>
          
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-3xl font-bold text-primary">{daysSinceLastRug}</div>
                  <div className="text-sm text-muted-foreground">Days Since Last Rug</div>
                </div>
                <Target className="h-8 w-8 text-accent" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Goal: Zero Rug Month (30 days)</p>
                <Progress value={(daysSinceLastRug / 30) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.max(0, 30 - daysSinceLastRug)} days remaining to achieve our goal
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent-rugs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent-rugs">Recent Rugs</TabsTrigger>
            <TabsTrigger value="active-tokens">Active Tokens</TabsTrigger>
            <TabsTrigger value="prevention">Prevention Tools</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="recent-rugs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rugged Coins List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <Skull className="mr-2 h-6 w-6 text-red-500" />
                  Rugged in Last 7 Days
                </h2>
                {MOCK_RUGGED_COINS.map((coin) => (
                  <Card 
                    key={coin.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRuggedCoin?.id === coin.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRuggedCoin(coin)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{coin.name} ({coin.symbol})</h3>
                          <Badge className={getRugTypeColor(coin.rugType)}>
                            {coin.rugType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-bold">${coin.totalLoss.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{coin.victimCount} victims</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Traded for: {coin.tradingDuration}</div>
                        <div>Rugged: {new Date(coin.rugDate).toLocaleDateString()}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detailed Analysis */}
              <div>
                {selectedRuggedCoin ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                        Rug Analysis: {selectedRuggedCoin.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Launch Date:</strong><br />
                          {new Date(selectedRuggedCoin.launchDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Rug Date:</strong><br />
                          {new Date(selectedRuggedCoin.rugDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Trading Duration:</strong><br />
                          {selectedRuggedCoin.tradingDuration}
                        </div>
                        <div>
                          <strong>Total Loss:</strong><br />
                          <span className="text-red-600 font-bold">
                            ${selectedRuggedCoin.totalLoss.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <strong className="block mb-2">Launcher Wallet:</strong>
                        <code className="bg-muted p-2 rounded text-xs block">
                          {selectedRuggedCoin.launcherWallet}
                        </code>
                      </div>

                      <div>
                        <strong className="block mb-2">Colluding Wallets:</strong>
                        {selectedRuggedCoin.colludingWallets.map((wallet, index) => (
                          <code key={index} className="bg-muted p-2 rounded text-xs block mb-1">
                            {wallet}
                          </code>
                        ))}
                      </div>

                      <div>
                        <strong className="block mb-2">Scammer Tactics:</strong>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {selectedRuggedCoin.tactics.map((tactic, index) => (
                            <li key={index}>{tactic}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a rugged coin to see detailed analysis
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="active-tokens" className="space-y-6">
            <h2 className="text-2xl font-bold">Active Meme Tokens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_MEME_TOKENS.map((token) => (
                <Card key={token.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{token.name}</CardTitle>
                        <CardDescription>{token.symbol}</CardDescription>
                      </div>
                      <Badge 
                        variant={token.status === 'active' ? 'default' : 'destructive'}
                      >
                        {token.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <strong>Risk Score:</strong> 
                      <span className={`ml-2 font-bold ${getRiskColor(token.riskScore)}`}>
                        {token.riskScore}/100
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Market Cap:</strong> ${token.marketCap.toLocaleString()}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Liquidity Locked:</span>
                        <Badge variant={token.liquidityLocked ? 'default' : 'destructive'}>
                          {token.liquidityLocked ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Contract Verified:</span>
                        <Badge variant={token.contractVerified ? 'default' : 'destructive'}>
                          {token.contractVerified ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Team Doxxed:</span>
                        <Badge variant={token.teamDoxxed ? 'default' : 'destructive'}>
                          {token.teamDoxxed ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    
                    <code className="text-xs bg-muted p-2 rounded block">
                      {token.address}
                    </code>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prevention" className="space-y-6">
            <h2 className="text-2xl font-bold">Prevention Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Quick Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Before You Invest</AlertTitle>
                      <AlertDescription>
                        Always check these factors before investing in any meme coin
                      </AlertDescription>
                    </Alert>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        Contract verification status
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        Liquidity lock duration
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        Team transparency
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        Trading volume patterns
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        Holder distribution
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2 h-5 w-5" />
                    Wallet Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor known scammer wallets and their activities
                  </p>
                  <Button className="w-full">
                    Track Suspicious Wallets
                  </Button>
                  <div className="mt-4 p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Recent Alerts:</div>
                    <div className="text-sm mt-1">
                      • 0x1234...5678 created new token
                    </div>
                    <div className="text-sm">
                      • 0x9876...5432 large sell detected
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <h2 className="text-2xl font-bold">Rug Pull Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Common Rug Pull Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold">Liquidity Pull</h4>
                    <p className="text-sm text-muted-foreground">
                      Developers remove all liquidity from the pool, making it impossible to sell tokens.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-bold">Honeypot</h4>
                    <p className="text-sm text-muted-foreground">
                      Smart contract allows buying but prevents selling through hidden code.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold">Mint Exploit</h4>
                    <p className="text-sm text-muted-foreground">
                      Developers mint massive amounts of tokens to dump on the market.
                    </p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-bold">Fake Team</h4>
                    <p className="text-sm text-muted-foreground">
                      Anonymous team disappears after collecting funds from investors.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Warning Signs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Anonymous team with no social presence',
                      'Unrealistic promises of returns',
                      'No liquidity lock or very short duration',
                      'Unverified smart contract',
                      'Unusual trading patterns or volume spikes',
                      'Pressure to invest quickly',
                      'No clear roadmap or utility',
                      'Heavy marketing with celebrity endorsements'
                    ].map((warning, index) => (
                      <div key={index} className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{warning}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}