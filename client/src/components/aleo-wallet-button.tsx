import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Aleo wallet connection button using the official wallet adapter
 */
export default function AleoWalletButton() {
  const { publicKey, connecting, connected, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

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
        <Button 
          onClick={disconnect}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  if (connecting || isConnecting) {
    return (
      <Button disabled className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Connecting...
      </Button>
    );
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      console.log('Attempting to connect...');
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect wallet. Please make sure Leo Wallet is installed and unlocked.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect}
      style={{ 
        backgroundColor: 'hsl(var(--zg-primary))',
        color: 'white'
      }}
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}