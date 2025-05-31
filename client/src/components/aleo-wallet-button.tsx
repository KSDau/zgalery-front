import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useEffect } from "react";

/**
 * Aleo wallet connection button using the official wallet adapter
 */
export default function AleoWalletButton() {
  const { publicKey, connecting, connected, wallets, select, wallet } = useWallet();

  // Debug wallet state
  useEffect(() => {
    console.log('Wallet state:', { publicKey, connecting, connected, wallets: wallets.length, selectedWallet: wallet?.adapter.name });
  }, [publicKey, connecting, connected, wallets, wallet]);

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

  // Custom button for Leo Wallet if detected but not connected
  const handleConnect = async () => {
    try {
      console.log('Attempting to connect to wallet...');
      if (wallets.length > 0) {
        const leoWallet = wallets.find(w => w.adapter.name === 'Leo Wallet');
        if (leoWallet) {
          console.log('Selecting Leo Wallet');
          select(leoWallet.adapter.name);
          await leoWallet.adapter.connect();
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <WalletMultiButton />
      {wallets.length > 0 && !connected && (
        <Button 
          onClick={handleConnect}
          className="ml-2"
          style={{ 
            backgroundColor: 'hsl(var(--zg-primary))',
            color: 'white'
          }}
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Leo Wallet
        </Button>
      )}
    </div>
  );
}