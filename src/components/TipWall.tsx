import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWallet, TIP_THRESHOLD_PLS, DONATION_ADDRESS } from "@/contexts/WalletContext";
import { X, Heart, Zap, Crown, CheckCircle, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface TipWallProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

const TIER_PREMIMS = [
  { name: "Supporter", min: 1, icon: Heart, perks: ["Basic PulseScore", "3 coin searches/day"] },
  { name: "Power User", min: 1, icon: Zap, perks: ["Unlimited searches", "ML predictions", "CSV export"] },
  { name: "Whale", min: 1, icon: Crown, perks: ["All Power User perks", "API access", "Custom alerts", "Priority support"] },
];

export function TipWall({ isOpen, onClose, onUnlock }: TipWallProps) {
  const { address, isConnected, balance, tipSent, tipAmount, sendTip, isSending, isChecking } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(DONATION_ADDRESS);
    toast.success("Address copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTip = async () => {
    const amount = parseFloat(customAmount) || selectedAmount;
    if (amount < 1) {
      toast.error("Minimum tip is 1 PLS");
      return;
    }
    const success = await sendTip(amount);
    if (success) {
      toast.success(`Sent ${amount} PLS! Premium unlocked.`);
      onUnlock();
    } else {
      toast.error("Transaction failed or cancelled");
    }
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-card border-card-border shadow-elevated animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Unlock Premium
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tip tiers */}
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Send PLS to unlock premium features. No subscriptions, no middlemen — just a one-time tip.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {TIER_PREMIMS.map((tier) => {
                const Icon = tier.icon;
                const active = tipAmount >= tier.min;
                return (
                  <div
                    key={tier.name}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      active
                        ? "border-primary/50 bg-primary/10"
                        : "border-card-border bg-card/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-xs font-semibold text-foreground">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.min}+ PLS</p>
                    {active && <CheckCircle className="h-3 w-3 text-primary mx-auto mt-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wallet status */}
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connected</span>
                <span className="font-mono text-foreground">{truncateAddress(address!)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className="text-foreground">{balance} PLS</span>
              </div>

              {tipSent ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="text-lg font-semibold text-foreground">Premium Unlocked!</p>
                  <p className="text-sm text-muted-foreground">
                    You tipped {tipAmount} PLS. Thank you for supporting PulseCycle Pro.
                  </p>
                  <Button onClick={() => { onUnlock(); onClose(); }} className="mt-4" variant="pro">
                    Continue to Premium
                  </Button>
                </div>
              ) : (
                <>
                  {/* Amount selector */}
                  <div className="flex gap-2">
                    {[1, 5, 10, 50].map((amt) => (
                      <Button
                        key={amt}
                        variant={selectedAmount === amt ? "pro" : "outline"}
                        size="sm"
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                        className="flex-1"
                      >
                        {amt}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="flex-1"
                      min="1"
                    />
                    <span className="text-sm text-muted-foreground">PLS</span>
                  </div>

                  <Button
                    onClick={handleSendTip}
                    disabled={isSending}
                    className="w-full"
                    variant="pro"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Send {(parseFloat(customAmount) || selectedAmount).toLocaleString()} PLS
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By sending, you agree this is a voluntary donation. No refunds.
                  </p>
                </>
              )}
            </div>
          ) : (
            /* Not connected */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to check tip status or send a donation.
              </p>
              <w3m-button label="Connect Wallet" balance="hide" size="md" />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-card-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or send manually</span>
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-3 border border-card-border">
                <p className="text-xs text-muted-foreground mb-2">Donation address</p>
                <p className="font-mono text-sm text-foreground break-all">{DONATION_ADDRESS}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={handleCopyAddress} className="flex-1">
                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <a
                    href={`https://scan.pulsechain.com/address/${DONATION_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      PulseScan
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
