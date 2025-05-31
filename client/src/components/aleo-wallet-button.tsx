import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Aleo wallet connection button using the official wallet adapter
 */
export default function AleoWalletButton() {
  const { publicKey, connecting, connected, wallets } = useWallet();
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);

  useEffect(() => {
    // Check if Leo Wallet is available
    const checkWalletAvailability = () => {
      const hasLeoWallet = !!(window as any).leoWallet;
      const hasAleoWallet = !!(window as any).aleo;
      setIsWalletAvailable(hasLeoWallet || hasAleoWallet);
    };

    checkWalletAvailability();
    
    // Check periodically in case wallet is installed after page load
    const interval = setInterval(checkWalletAvailability, 2000);
    
    return () => clearInterval(interval);
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
      </div>
    );
  }

  return <WalletMultiButton />;
}