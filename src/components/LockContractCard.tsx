import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  Clock, 
  Users, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface LockContract {
  id: string;
  contractAddress: string;
  tokenSymbol: string;
  lockAmount: number;
  lockDurationDays: number;
  unlockDate: string;
  status: string;
  isMultisig: boolean;
  securityScore: number;
  lockType: string;
  verificationCount: number;
  communityRating: number;
}

interface LockContractCardProps {
  contract: LockContract;
  onVerify?: (contractId: string) => void;
  onViewDetails?: (contractId: string) => void;
}

export default function LockContractCard({ 
  contract, 
  onVerify, 
  onViewDetails 
}: LockContractCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-red-500';
      case 'emergency_unlocked': return 'bg-orange-500';
      default: return 'bg-muted';
    }
  };

  const getSecurityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLockTypeIcon = (type: string) => {
    switch (type) {
      case 'liquidity': return <TrendingUp className="h-4 w-4" />;
      case 'team_tokens': return <Users className="h-4 w-4" />;
      case 'marketing': return <Shield className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const daysUntilUnlock = Math.max(0, Math.ceil(
    (new Date(contract.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  const lockProgress = Math.max(0, Math.min(100, 
    ((contract.lockDurationDays - daysUntilUnlock) / contract.lockDurationDays) * 100
  ));

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getLockTypeIcon(contract.lockType)}
            {contract.tokenSymbol}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(contract.status)} text-white`}
            >
              {contract.status}
            </Badge>
            {contract.isMultisig && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Multi-sig
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lock Amount */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Locked Amount</span>
          <span className="font-medium">{contract.lockAmount.toLocaleString()} {contract.tokenSymbol}</span>
        </div>

        {/* Unlock Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Unlock Progress
            </span>
            <span className="text-sm font-medium">{daysUntilUnlock} days left</span>
          </div>
          <Progress value={lockProgress} className="h-2" />
        </div>

        {/* Security Score */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Security Score
          </span>
          <span className={`font-medium ${getSecurityColor(contract.securityScore)}`}>
            {contract.securityScore}/100
          </span>
        </div>

        {/* Community Verification */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Community Rating
          </span>
          <div className="flex items-center gap-1">
            <span className="font-medium">{contract.communityRating.toFixed(1)}/5</span>
            <span className="text-xs text-muted-foreground">({contract.verificationCount} votes)</span>
          </div>
        </div>

        {/* Unlock Date */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Unlock Date
          </span>
          <span className="text-sm font-medium">
            {new Date(contract.unlockDate).toLocaleDateString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(contract.id)}
          >
            View Details
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onVerify?.(contract.id)}
          >
            Verify Lock
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}