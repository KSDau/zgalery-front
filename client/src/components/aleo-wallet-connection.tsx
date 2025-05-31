import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Simplified Aleo wallet connection interface
 */
interface AleoWalletConnection {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

/**
 * Aleo wallet connection component that handles wallet detection and connection
 */
export default function AleoWalletConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const { toast } = useToast();

  /**
   * Check if Aleo wallet is available in the browser
   */
  useEffect(() => {
    const checkWalletAvailability = () => {
      // Check for common Aleo wallet extensions
      const hasLeoWallet = !!(window as any).leoWallet;
      const hasAleoWallet = !!(window as any).aleo;
      setIsWalletAvailable(hasLeoWallet || hasAleoWallet);
    };

    checkWalletAvailability();
    
    // Check periodically in case wallet is installed after page load
    const interval = setInterval(checkWalletAvailability, 1000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Connect to Aleo wallet
   */
  const connectWallet = async () => {
    if (!isWalletAvailable) {
      setError('No Aleo wallet found. Please install Leo Wallet or another Aleo-compatible wallet.');
      toast({
        title: "Wallet Not Found",
        description: "Please install Leo Wallet or another Aleo-compatible wallet extension.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Try Leo Wallet first
      const wallet = (window as any).leoWallet || (window as any).aleo;
      
      if (wallet) {
        // Request connection
        const response = await wallet.request({ method: 'connect' });
        const walletAddress = response?.address || response;
        
        if (walletAddress) {
          setAddress(walletAddress);
          setIsConnected(true);
          toast({
            title: "Wallet Connected",
            description: `Successfully connected to ${formatAddress(walletAddress)}`,
          });
        } else {
          throw new Error('No address returned from wallet');
        }
      } else {
        throw new Error('Wallet not accessible');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect from Aleo wallet
   */
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setError(null);
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from wallet",
    });
  };

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

  if (!isWalletAvailable) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => window.open('https://leo.app/', '_blank')}
          className="text-sm"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Install Leo Wallet
        </Button>
      </div>
    );
  }

  if (isConnected && address) {
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
            {isValidAleoAddress(address) ? formatAddress(address) : address}
          </span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectWallet}
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        variant="outline"
        className="text-sm"
        style={{ 
          borderColor: 'hsl(var(--zg-border))',
          color: 'hsl(var(--zg-primary))'
        }}
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Aleo Wallet'}
      </Button>
      {error && (
        <Badge variant="destructive" className="text-xs">
          Connection Failed
        </Badge>
      )}
    </div>
  );
}