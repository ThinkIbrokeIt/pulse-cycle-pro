import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

export function FeatureCard({ icon, title, description, highlight }: FeatureCardProps) {
  return (
    <Card className={`p-6 transition-all duration-300 hover:scale-105 ${
      highlight 
        ? "bg-gradient-glow border-primary/50 shadow-glow/20" 
        : "bg-card/50 backdrop-blur border-card-border hover:border-primary/30"
    }`}>
      <div className={`mb-4 ${highlight ? "text-primary-glow" : "text-primary"}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}