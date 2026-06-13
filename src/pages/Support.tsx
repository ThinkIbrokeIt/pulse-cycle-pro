import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const DONATION_ADDRESS = "0x45bb318ae758c1bb8074389d899cb25468e18d09";

export default function Support() {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(DONATION_ADDRESS);
    toast.success("Address copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Nav */}
      <nav className="container mx-auto px-6 py-6">
        <a href="/" className="text-xl font-bold text-foreground hover:text-primary transition">
          ← Back to PulseCycle Pro
        </a>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Support PulseCycle Pro
          </h1>
          <p className="text-lg text-muted-foreground">
            PulseChain's #1 cycle analytics platform. No subscriptions, no tokens — just
            community-powered tools for a safer, smarter PulseChain.
          </p>
        </div>

        <Card className="p-8 bg-gradient-glow border-primary/30 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Buy the Team a Coffee ☕
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Every PLS helps us build faster, add more features, and keep the platform free for everyone.
            </p>

            <div className="bg-card rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-2">Donation Address (PLS)</p>
              <p className="font-mono text-sm text-foreground break-all">{DONATION_ADDRESS}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={copyAddress} variant="outline" className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : `Copy ${truncateAddress(DONATION_ADDRESS)}`}
              </Button>
              <a
                href={`https://scan.pulsechain.com/address/${DONATION_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on PulseScan
                </Button>
              </a>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-card/50 border-card-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">🌐 Free Tools</h3>
            <p className="text-sm text-muted-foreground">
              PulseScore analytics, security center, and community hub — all free. Forever.
            </p>
          </Card>
          <Card className="p-6 bg-card/50 border-card-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">🔒 Trustless Locks</h3>
            <p className="text-sm text-muted-foreground">
              Anti-rug liquidity locks for any PulseChain token. 98/2 split — no middlemen.
            </p>
          </Card>
          <Card className="p-6 bg-card/50 border-card-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">🛡️ Security Center</h3>
            <p className="text-sm text-muted-foreground">
              Rug pull tracker, scammer wallet database, token risk scoring. Powered by the community.
            </p>
          </Card>
          <Card className="p-6 bg-card/50 border-card-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">📊 ML Predictions</h3>
            <p className="text-sm text-muted-foreground">
              Cycle phase predictions trained on 5+ years of PulseChain data. 92% accuracy.
            </p>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Built for the PulseChain community, by the PulseChain community.</p>
          <p className="mt-2">No VCs, no tokens, no subscriptions — just code that works.</p>
        </div>
      </div>
    </div>
  );
}
