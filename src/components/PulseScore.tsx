import { Card } from "@/components/ui/card";

interface PulseScoreProps {
  score: number;
  symbol: string;
  change24h: number;
  phase: string;
}

export function PulseScore({ score, symbol, change24h, phase }: PulseScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case "accumulation": return "text-chart-3";
      case "uptrend": return "text-success";
      case "distribution": return "text-warning";
      case "downtrend": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-card-border hover:border-primary/30 transition-all duration-300 hover:shadow-glow/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{symbol}</h3>
          <p className={`text-sm ${getPhaseColor(phase)}`}>{phase}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className={`text-sm ${change24h >= 0 ? "text-success" : "text-destructive"}`}>
            {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              score >= 80 ? "bg-gradient-to-r from-success to-success" :
              score >= 60 ? "bg-gradient-to-r from-warning to-warning" :
              "bg-gradient-to-r from-destructive to-destructive"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          PulseScore™ - Next peak prediction confidence
        </div>
      </div>
    </Card>
  );
}