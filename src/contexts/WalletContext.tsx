import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { pulsechain, pulsechainV4 } from "@reown/appkit/networks";
import { WagmiProvider, useAccount, useDisconnect, useBalance, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const DONATION_ADDRESS = "0x45bb318ae758c1bb8074389d899cb25468e18d09";
const TIP_THRESHOLD_PLS = 1; // testing mode — real tiers TBD

const queryClient = new QueryClient();

const wagmiAdapter = new WagmiAdapter({
  networks: [pulsechain, pulsechainV4],
  projectId: "259d94965e77d4b71189558d44695aad",
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [pulsechain, pulsechainV4],
  projectId: "259d94965e77d4b71189558d44695aad",
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "hsl(217 91% 60%)",
    "--w3m-color-mix": "hsl(217 91% 60%)",
  },
});

interface WalletContextValue {
  address: string | null;
  isConnected: boolean;
  balance: string | null;
  tipSent: boolean;
  tipAmount: number;
  checkTipStatus: () => Promise<void>;
  sendTip: (amount: number) => Promise<boolean>;
  disconnect: () => void;
  isChecking: boolean;
  isSending: boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

function WalletInner({ children }: { children: ReactNode }) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();

  const [tipSent, setTipSent] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const checkTipStatus = useCallback(async () => {
    if (!address) return;
    setIsChecking(true);
    try {
      const stored = localStorage.getItem(`tip_${address.toLowerCase()}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTipSent(true);
        setTipAmount(parsed.amount);
      } else {
        setTipSent(false);
        setTipAmount(0);
      }
    } catch (err) {
      console.error("Failed to check tip status:", err);
    } finally {
      setIsChecking(false);
    }
  }, [address]);

  const sendTip = useCallback(async (amount: number): Promise<boolean> => {
    if (!address) return false;
    setIsSending(true);
    try {
      if (chainId !== 369) {
        await switchChainAsync({ chainId: 369 });
      }

      const hash = await sendTransactionAsync({
        to: DONATION_ADDRESS,
        value: parseEther(amount.toString()),
      });

      localStorage.setItem(
        `tip_${address.toLowerCase()}`,
        JSON.stringify({ amount, hash, timestamp: Date.now() })
      );
      setTipSent(true);
      setTipAmount(amount);
      return true;
    } catch (err) {
      console.error("Failed to send tip:", err);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [address, chainId, sendTransactionAsync, switchChainAsync]);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setTipSent(false);
    setTipAmount(0);
  }, [wagmiDisconnect]);

  useEffect(() => {
    if (isConnected && address) {
      checkTipStatus();
    }
  }, [isConnected, address, checkTipStatus]);

  return (
    <WalletContext.Provider
      value={{
        address: address || null,
        isConnected,
        balance: balanceData ? (Number(balanceData.value) / 1e18).toFixed(4) : null,
        tipSent,
        tipAmount,
        checkTipStatus,
        sendTip,
        disconnect,
        isChecking,
        isSending,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletInner>{children}</WalletInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { DONATION_ADDRESS, TIP_THRESHOLD_PLS };
