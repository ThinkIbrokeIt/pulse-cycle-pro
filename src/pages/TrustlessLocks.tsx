import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LockContractCard from '@/components/LockContractCard';
import CreateLockDialog from '@/components/CreateLockDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Lock, 
  Plus, 
  Search, 
  TrendingUp, 
  Shield, 
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface LockContract {
  id: string;
  contract_address: string;
  contract_type: string;
  token_address: string;
  token_symbol: string;
  lock_amount: number;
  lock_duration_days: number;
  unlock_date: string;
  beneficiary_address: string;
  is_multisig: boolean;
  required_signatures: number;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalLocks: number;
  totalValueLocked: number;
  activeLocks: number;
  averageSecurityScore: number;
}

export default function TrustlessLocks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [lockContracts, setLockContracts] = useState<LockContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<LockContract[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalLocks: 0,
    totalValueLocked: 0,
    activeLocks: 0,
    averageSecurityScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLockContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [searchQuery, lockContracts]);

  const fetchLockContracts = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('lock_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contracts = data || [];
      setLockContracts(contracts);
      
      // Calculate dashboard stats
      const totalLocks = contracts.length;
      const activeLocks = contracts.filter(c => c.status === 'active').length;
      const totalValueLocked = contracts.reduce((sum, c) => sum + c.lock_amount, 0);
      
      setDashboardStats({
        totalLocks,
        totalValueLocked,
        activeLocks,
        averageSecurityScore: 75 // Mock average
      });

    } catch (error) {
      console.error('Error fetching lock contracts:', error);
      toast.error('Failed to fetch lock contracts');
    } finally {
      setIsLoading(false);
    }
  };

  const filterContracts = () => {
    if (!searchQuery.trim()) {
      setFilteredContracts(lockContracts);
      return;
    }

    const filtered = lockContracts.filter(contract =>
      contract.token_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contract_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.token_address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredContracts(filtered);
  };

  const handleVerifyContract = (contractId: string) => {
    toast.info('Contract verification feature coming soon!');
  };

  const handleViewDetails = (contractId: string) => {
    toast.info('Contract details view coming soon!');
  };

  // Transform contracts for display
  const displayContracts = filteredContracts.map(contract => ({
    id: contract.id,
    contractAddress: contract.contract_address,
    tokenSymbol: contract.token_symbol,
    lockAmount: contract.lock_amount,
    lockDurationDays: contract.lock_duration_days,
    unlockDate: contract.unlock_date,
    status: contract.status,
    isMultisig: contract.is_multisig,
    securityScore: Math.floor(Math.random() * 40) + 60, // Mock security score
    lockType: contract.contract_type,
    verificationCount: Math.floor(Math.random() * 20) + 5, // Mock verification count
    communityRating: Math.random() * 2 + 3 // Mock rating 3-5
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Lock className="h-8 w-8" />
                Trustless Lock Contracts
              </h1>
              <p className="text-muted-foreground text-lg">
                Secure your tokens with community-verified lock contracts
              </p>
            </div>
            <CreateLockDialog>
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Lock
              </Button>
            </CreateLockDialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Locks</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalLocks}</p>
                </div>
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Locks</p>
                  <p className="text-2xl font-bold">{dashboardStats.activeLocks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                  <p className="text-2xl font-bold">{formatNumber(dashboardStats.totalValueLocked)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Security Score</p>
                  <p className="text-2xl font-bold">{dashboardStats.averageSecurityScore}/100</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all-locks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-locks">All Locks</TabsTrigger>
            <TabsTrigger value="my-locks">My Locks</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all-locks" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by token symbol or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lock Contracts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-4"></div>
                      <div className="h-3 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayContracts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Lock Contracts Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to create a trustless lock contract!'}
                  </p>
                  <CreateLockDialog>
                    <Button>Create Your First Lock</Button>
                  </CreateLockDialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayContracts.map((contract) => (
                  <LockContractCard
                    key={contract.id}
                    contract={contract}
                    onVerify={handleVerifyContract}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-locks">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Authentication required to view your lock contracts. Please log in to continue.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="templates">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Lock template management coming soon! You can create locks using our built-in templates.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="analytics">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Advanced analytics dashboard coming soon! Track lock performance and security metrics.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}