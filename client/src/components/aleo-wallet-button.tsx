import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Aleo wallet connection button using the official wallet adapter
 */
export default function AleoWalletButton() {
  const { publicKey, connecting, connected, wallets } = useWallet();
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Leo Wallet is available
    const checkWalletAvailability = () => {
      // Check for Leo Wallet in multiple ways
      const hasLeoWallet = !!(window as any).leoWallet;
      const hasAleoWallet = !!(window as any).aleo;
      const hasWalletInWindow = !!(window as any).leo;
      
      console.log("Wallet detection:", {
        hasLeoWallet,
        hasAleoWallet, 
        hasWalletInWindow,
        userAgent: navigator.userAgent
      });
      
      setIsWalletAvailable(hasLeoWallet || hasAleoWallet || hasWalletInWindow);
    };

    checkWalletAvailability();
    
    // Check periodically and when DOM is ready
    const interval = setInterval(checkWalletAvailability, 1000);
    document.addEventListener('DOMContentLoaded', checkWalletAvailability);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('DOMContentLoaded', checkWalletAvailability);
    };
  }, []);

  // Debug wallet state
  useEffect(() => {
    console.log("Wallet state:", {
      publicKey: publicKey?.slice(0, 10) + "..." || null,
      connecting,
      connected,
      wallets: wallets.length,
      selectedWallet: wallets.find(w => w.readyState === 'Installed')?.adapter.name
    });
  }, [publicKey, connecting, connected, wallets]);

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border" 
             style={{ borderColor: 'hsl(var(--zg-border))', backgroundColor: 'hsl(var(--zg-card))' }}>
          <Wallet className="w-4 h-4" style={{ color: 'hsl(var(--zg-primary))' }} />
          <span className="text-sm font-medium" style={{ color: 'hsl(var(--zg-foreground))' }}>
            {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
          </span>
        </div>
        <WalletMultiButton />
      </div>
    );
  }

  if (connecting) {
    return (
      <Button disabled className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Connecting...
      </Button>
    );
  }

  // Show install prompt if wallet is not available
  if (!isWalletAvailable) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => window.open('https://leo.app/', '_blank')}
          className="flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Install Leo Wallet
          <ExternalLink className="w-3 h-3" />
        </Button>
        <Button
          variant="default"
          onClick={() => {
            toast({
              title: "Demo Mode",
              description: "Using simulation mode - no real transactions will be made.",
            });
          }}
          className="flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Demo Mode
        </Button>
      </div>
    );
  }

  return <WalletMultiButton />;
}