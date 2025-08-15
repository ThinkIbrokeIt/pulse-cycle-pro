import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  onSelect: () => void;
}

export function PricingCard({ 
  title, 
  price, 
  description, 
  features, 
  popular, 
  ctaText, 
  onSelect 
}: PricingCardProps) {
  return (
    <Card className={`p-8 relative transition-all duration-300 hover:scale-105 ${
      popular 
        ? "bg-gradient-glow border-primary shadow-glow/30 ring-2 ring-primary/20" 
        : "bg-card/50 backdrop-blur border-card-border hover:border-primary/30"
    }`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold text-primary">{price}</span>
          {price !== "Free" && <span className="text-muted-foreground">/month</span>}
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Check className="h-4 w-4 text-success flex-shrink-0" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={popular ? "pro" : "outline"}
        className="w-full"
        onClick={onSelect}
      >
        {ctaText}
      </Button>
    </Card>
  );
}