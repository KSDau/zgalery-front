import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
}

/**
 * Simplified wallet connection component that works directly with Leo Wallet
 */
export default function SimpleWalletButton() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false
  });
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Leo Wallet is installed
    const checkWallet = () => {
      try {
        const leoWallet = (window as any).leoWallet;
        const hasLeoWallet = !!(leoWallet && typeof leoWallet === 'object');
        setIsWalletInstalled(hasLeoWallet);
        
        if (hasLeoWallet) {
          console.log('Leo Wallet detected:', {
            hasConnect: typeof leoWallet.connect === 'function',
            hasRequestConnection: typeof leoWallet.requestConnection === 'function',
            methods: Object.keys(leoWallet)
          });
        }
        
        // Check if already connected
        if (hasLeoWallet) {
          const savedAddress = localStorage.getItem('aleo_wallet_address');
          if (savedAddress) {
            setWalletState({
              isConnected: true,
              address: savedAddress,
              isConnecting: false
            });
          }
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
        setIsWalletInstalled(false);
      }
    };

    checkWallet();
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (!isWalletInstalled) {
      toast({
        title: "Leo Wallet Required",
        description: "Please install Leo Wallet to connect.",
        variant: "destructive",
      });
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true }));

    try {
      const leoWallet = (window as any).leoWallet;
      
      if (!leoWallet) {
        throw new Error("Leo Wallet not found");
      }

      // Connect using the Leo Wallet API
      const response = await leoWallet.connect({
        appName: "zgallery",
        network: "testnet3"
      });

      console.log('Wallet response:', response);

      // Get the public key/address from the wallet
      let address = null;
      if (leoWallet.publicKey) {
        address = leoWallet.publicKey;
      } else if (response && typeof response === 'string') {
        address = response;
      } else if (response && response.publicKey) {
        address = response.publicKey;
      }

      if (address && typeof address === 'string') {
        localStorage.setItem('aleo_wallet_address', address);
        setWalletState({
          isConnected: true,
          address: address,
          isConnecting: false
        });
        
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to Leo Wallet.",
        });
      } else {
        throw new Error("Failed to get wallet address from response");
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Leo Wallet. Please make sure it's installed and unlocked.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('aleo_wallet_address');
    setWalletState({
      isConnected: false,
      address: null,
      isConnecting: false
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from Leo Wallet.",
    });
  };

  if (!isWalletInstalled) {
    return (
      <Button
        variant="outline"
        onClick={() => window.open('https://leo.app/', '_blank')}
        className="flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        Install Leo Wallet
        <ExternalLink className="w-3 h-3" />
      </Button>
    );
  }

  if (walletState.isConnecting) {
    return (
      <Button disabled className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-md border" 
          style={{ borderColor: 'hsl(var(--zg-border))', backgroundColor: 'hsl(var(--zg-card))' }}
        >
          <Wallet className="w-4 h-4" style={{ color: 'hsl(var(--zg-primary))' }} />
          <span className="text-sm font-medium" style={{ color: 'hsl(var(--zg-foreground))' }}>
            {walletState.address.slice(0, 6)}...{walletState.address.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  const connectDemo = () => {
    const demoAddress = "aleo1demo1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefg";
    localStorage.setItem('aleo_wallet_address', demoAddress);
    setWalletState({
      isConnected: true,
      address: demoAddress,
      isConnecting: false
    });
    
    toast({
      title: "Demo Mode Connected",
      description: "Using demo wallet for testing marketplace functionality.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={connectWallet} className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
      <Button
        onClick={connectDemo}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        Demo Mode
      </Button>
    </div>
  );
}

// Export wallet state for use in other components
export function useSimpleWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('aleo_wallet_address');
    if (savedAddress) {
      setIsConnected(true);
      setAddress(savedAddress);
    }

    const handleStorageChange = () => {
      const newAddress = localStorage.getItem('aleo_wallet_address');
      setIsConnected(!!newAddress);
      setAddress(newAddress);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isConnected, address };
}