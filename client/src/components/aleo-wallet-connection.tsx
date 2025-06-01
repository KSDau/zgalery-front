import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Aleo wallet connection component using Leo wallet adapter
 */
export default function AleoWalletConnection() {
  const { wallet, publicKey, connecting, connected, disconnect } = useWallet();
  const { toast } = useToast();

  /**
   * Format Aleo address for display
   */
  const formatAddress = (addr: string): string => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /**
   * Validate Aleo address format
   */
  const isValidAleoAddress = (addr: string): boolean => {
    return /^aleo1[a-z0-9]{58}$/.test(addr);
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  // If connected, show address and disconnect button
  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className="flex items-center gap-2 px-3 py-1"
          style={{ 
            backgroundColor: 'hsl(var(--zg-secondary))', 
            color: 'hsl(var(--zg-primary))' 
          }}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span className="font-mono text-xs">
            {isValidAleoAddress(publicKey) ? formatAddress(publicKey) : publicKey}
          </span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Use the wallet adapter's built-in button for connection
  return (
    <div className="flex items-center gap-2">
      <WalletMultiButton 
        style={{
          backgroundColor: 'transparent',
          border: '1px solid hsl(var(--zg-border))',
          color: 'hsl(var(--zg-primary))',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      />
      {connecting && (
        <Badge variant="outline" className="text-xs">
          Connecting...
        </Badge>
      )}
    </div>
  );
}