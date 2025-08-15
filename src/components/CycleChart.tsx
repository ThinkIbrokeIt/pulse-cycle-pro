import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";

const mockData = [
  { date: "Jan", price: 0.00015, cycle: 30, prediction: 0.00018 },
  { date: "Feb", price: 0.00018, cycle: 45, prediction: 0.00022 },
  { date: "Mar", price: 0.00025, cycle: 60, prediction: 0.00028 },
  { date: "Apr", price: 0.00032, cycle: 75, prediction: 0.00035 },
  { date: "May", price: 0.00045, cycle: 85, prediction: 0.00048 },
  { date: "Jun", price: 0.00038, cycle: 70, prediction: 0.00042 },
  { date: "Jul", price: 0.00052, cycle: 90, prediction: 0.00055 },
];

export function CycleChart() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-card-border">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">PLS Cycle Analysis</h3>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            <span className="text-muted-foreground">Historical Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
            <span className="text-muted-foreground">Cycle Prediction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-3"></div>
            <span className="text-muted-foreground">Confidence Zone</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(5)}`}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              fill="url(#priceGradient)"
            />
            <Line
              type="monotone"
              dataKey="prediction"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-4 bg-card-elevated/50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-success">+287%</div>
            <div className="text-xs text-muted-foreground">Predicted Peak</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-chart-2">Oct 15, 2025</div>
            <div className="text-xs text-muted-foreground">Est. Peak Date</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning">92%</div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
        </div>
      </div>
    </Card>
  );
}