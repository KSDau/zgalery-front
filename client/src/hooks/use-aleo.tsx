import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { aleoProvider, AleoUtils } from '@/lib/aleo';

/**
 * Aleo wallet connection state interface
 */
interface AleoContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  networkStatus: { height: number; hash: string } | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isWalletAvailable: boolean;
}

/**
 * Context for Aleo wallet state management
 */
const AleoContext = createContext<AleoContextType | undefined>(undefined);

/**
 * Provider component for Aleo wallet state
 */
export function AleoProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{ height: number; hash: string } | null>(null);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);

  /**
   * Check wallet availability on component mount
   */
  useEffect(() => {
    const checkWalletAvailability = () => {
      setIsWalletAvailable(aleoProvider.isWalletAvailable());
    };

    checkWalletAvailability();
    
    // Check periodically in case wallet is installed after page load
    const interval = setInterval(checkWalletAvailability, 1000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Check for existing connection on mount
   */
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const walletAddress = await aleoProvider.getWalletAddress();
        if (walletAddress && aleoProvider.isConnected()) {
          setAddress(walletAddress);
          setIsConnected(true);
          await updateNetworkStatus();
        }
      } catch (error) {
        console.error('Failed to check existing connection:', error);
      }
    };

    if (isWalletAvailable) {
      checkExistingConnection();
    }
  }, [isWalletAvailable]);

  /**
   * Update network status information
   */
  const updateNetworkStatus = async () => {
    try {
      const status = await aleoProvider.getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error('Failed to get network status:', error);
    }
  };

  /**
   * Connect to Aleo wallet
   */
  const connectWallet = async () => {
    if (!isWalletAvailable) {
      setError('No Aleo wallet found. Please install Leo Wallet or another Aleo-compatible wallet.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const walletAddress = await aleoProvider.connectWallet();
      setAddress(walletAddress);
      setIsConnected(true);
      await updateNetworkStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect from Aleo wallet
   */
  const disconnectWallet = async () => {
    try {
      await aleoProvider.disconnectWallet();
      setAddress(null);
      setIsConnected(false);
      setNetworkStatus(null);
      setError(null);
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };

  const value: AleoContextType = {
    isConnected,
    address,
    isConnecting,
    error,
    networkStatus,
    connectWallet,
    disconnectWallet,
    isWalletAvailable,
  };

  return (
    <AleoContext.Provider value={value}>
      {children}
    </AleoContext.Provider>
  );
}

/**
 * Hook to use Aleo wallet functionality
 */
export function useAleo() {
  const context = useContext(AleoContext);
  if (context === undefined) {
    throw new Error('useAleo must be used within an AleoProvider');
  }
  return context;
}

/**
 * Utility hook for Aleo address formatting and validation
 */
export function useAleoUtils() {
  return {
    formatAddress: AleoUtils.formatAddress,
    isValidAddress: AleoUtils.isValidAddress,
    formatCredits: AleoUtils.formatCredits,
    parseCredits: AleoUtils.parseCredits,
  };
}