import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";

/**
 * WalletConnection component that handles Web3 wallet connection and display
 * of the connected wallet address.
 */
export default function WalletConnection() {
  const { address, isConnecting, connectWallet, disconnectWallet } = useWeb3();

  if (address) {
    return (
      <div className="flex items-center space-x-4">
        <Badge 
          variant="secondary" 
          className="px-4 py-2 font-mono text-sm cursor-pointer hover:opacity-80 transition-opacity"
          onClick={disconnectWallet}
          style={{ 
            backgroundColor: 'hsl(var(--zg-secondary))',
            color: 'hsl(var(--zg-muted))'
          }}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {address.substring(0, 6)}...{address.substring(38)}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-2 font-medium transition-colors duration-200"
        style={{ 
          backgroundColor: 'hsl(var(--zg-primary))',
          color: 'hsl(var(--zg-bg))'
        }}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  );
}
