import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Zap, 
  Calendar,
  ExternalLink 
} from 'lucide-react';

interface EmbedWidgetProps {
  symbol: string;
  name: string;
  pulseScore: number;
  currentPhase: 'Accumulation' | 'Uptrend' | 'Distribution' | 'Downtrend';
  nextPeak: string;
  confidence: number;
  compact?: boolean;
}

const EmbedWidget = ({ 
  symbol, 
  name, 
  pulseScore, 
  currentPhase, 
  nextPeak, 
  confidence,
  compact = false 
}: EmbedWidgetProps) => {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Accumulation': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'Uptrend': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'Distribution': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'Downtrend': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (compact) {
    return (
      <Card className="p-3 bg-card border-card-border max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground text-sm">{symbol}</span>
          </div>
          <Badge className={`text-xs ${getPhaseColor(currentPhase)}`}>
            {currentPhase}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            <span className={`font-bold text-sm ${getScoreColor(pulseScore)}`}>
              {pulseScore}
            </span>
          </div>
          <a 
            href={`${window.location.origin}/pulse-insight?token=${symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary-glow transition-colors"
          >
            View Details →
          </a>
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          PulseCycle Pro
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-card-border max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
        </div>
        <Badge className={`${getPhaseColor(currentPhase)}`}>
          {currentPhase}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">PulseScore</span>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(pulseScore)}`}>
            {pulseScore}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">Confidence</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {confidence}%
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-3">
        Next Peak Target: {nextPeak}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Powered by PulseCycle Pro
        </span>
        <a 
          href={`${window.location.origin}/pulse-insight?token=${symbol}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline" className="h-6 text-xs">
            <ExternalLink className="h-3 w-3 mr-1" />
            Analyze
          </Button>
        </a>
      </div>
    </Card>
  );
};

export default EmbedWidget;