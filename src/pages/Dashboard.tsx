import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PulseScore } from '@/components/PulseScore';
import { CycleChart } from '@/components/CycleChart';
import { usePulseAnalytics } from '@/hooks/usePulseAnalytics';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  TrendingUp, 
  User, 
  LogOut, 
  Settings, 
  Crown,
  BarChart3,
  Bell,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { analytics, loading: analyticsLoading, error, refetch } = usePulseAnalytics();
  const { userTier, subscriptionPlans, loading: subLoading } = useSubscription();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const topPerformers = analytics
    .reduce((acc, item) => {
      if (!acc.find(a => a.coin_symbol === item.coin_symbol)) {
        acc.push(item);
      }
      return acc;
    }, [] as typeof analytics)
    .sort((a, b) => b.pulse_score - a.pulse_score)
    .slice(0, 4);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'text-warning';
      case 'enterprise': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getTierDisplay = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-card-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">PulseCycle Pro</h1>
                <p className="text-sm text-muted-foreground">Analytics Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={getTierColor(userTier)}>
                {userTier === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                {userTier === 'enterprise' && <Crown className="h-3 w-3 mr-1" />}
                {getTierDisplay(userTier)}
              </Badge>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/50 backdrop-blur border-card-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Signals</p>
                <p className="text-2xl font-bold text-foreground">{topPerformers.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 backdrop-blur border-card-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {topPerformers.length > 0 
                    ? Math.round(topPerformers.reduce((acc, p) => acc + p.pulse_score, 0) / topPerformers.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 backdrop-blur border-card-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan Limit</p>
                <p className="text-2xl font-bold text-foreground">
                  {userTier === 'free' ? '3' : userTier === 'pro' ? '∞' : '∞'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 backdrop-blur border-card-border">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch}
                disabled={analyticsLoading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Grid */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pulse Scores */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Top Performers</h2>
                {userTier === 'free' && (
                  <Badge variant="outline" className="text-warning">
                    Free Plan - Limited to 24h data
                  </Badge>
                )}
              </div>
              
              {analyticsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="p-6 bg-card/50 animate-pulse">
                      <div className="h-20 bg-muted rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="p-6 bg-destructive/10 border-destructive/20">
                  <p className="text-destructive">Error loading analytics: {error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refetch}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </Card>
              ) : topPerformers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topPerformers.map((item) => (
                    <PulseScore
                      key={`${item.coin_symbol}-${item.id}`}
                      score={item.pulse_score}
                      symbol={item.coin_symbol}
                      change24h={Math.random() * 20 - 10} // Mock 24h change since not in DB
                      phase={item.current_phase}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-card/50">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Analytics Available</h3>
                  <p className="text-muted-foreground mb-4">
                    We're still gathering data for your analytics dashboard.
                  </p>
                  <Button onClick={refetch} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </Button>
                </Card>
              )}
            </div>

            {/* Chart Section */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Cycle Analysis</h2>
              <CycleChart />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Info */}
            <Card className="p-6 bg-card/50 backdrop-blur border-card-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Plan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Plan</span>
                  <Badge className={getTierColor(userTier)}>
                    {getTierDisplay(userTier)}
                  </Badge>
                </div>
                
                {userTier === 'free' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Coins Limit</span>
                      <span className="text-foreground">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Data History</span>
                      <span className="text-foreground">24 hours</span>
                    </div>
                    <Button variant="default" className="w-full mt-4">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </>
                )}
                
                {userTier === 'pro' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Coins Limit</span>
                      <span className="text-foreground">Unlimited</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Data History</span>
                      <span className="text-foreground">5 years</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-card/50 backdrop-blur border-card-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Manage Alerts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  API Access
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;