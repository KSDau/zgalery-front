import { Account, AleoKeyProvider, AleoNetworkClient, NetworkRecordProvider, ProgramManager } from '@aleohq/sdk';

/**
 * Aleo network configuration for testnet
 */
export const ALEO_CONFIG = {
  NETWORK_URL: 'https://api.explorer.aleo.org/v1',
  TESTNET_URL: 'https://api.explorer.aleo.org/v1/testnet3',
  PROGRAM_IDS: {
    NFT: 'zgallery_nft.aleo',
    MARKETPLACE: 'zgallery_marketplace.aleo'
  }
};

/**
 * Aleo wallet interface for browser wallet detection and connection
 */
interface AleoWallet {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (data: unknown) => void) => void;
  removeListener: (event: string, callback: (data: unknown) => void) => void;
  isConnected?: boolean;
  publicKey?: string;
}

declare global {
  interface Window {
    aleo?: AleoWallet;
    leoWallet?: AleoWallet;
  }
}

/**
 * Aleo provider instance for blockchain interactions
 */
export class AleoProvider {
  private keyProvider: AleoKeyProvider | null = null;
  private networkClient: AleoNetworkClient | null = null;
  private recordProvider: NetworkRecordProvider | null = null;
  private programManager: ProgramManager | null = null;
  private account: Account | null = null;

  constructor() {
    this.initializeProvider();
  }

  /**
   * Initialize the Aleo provider with testnet configuration
   */
  private async initializeProvider() {
    try {
      this.keyProvider = new AleoKeyProvider();
      this.networkClient = new AleoNetworkClient(ALEO_CONFIG.TESTNET_URL);
      this.recordProvider = new NetworkRecordProvider(this.account!, this.networkClient);
      this.programManager = new ProgramManager(
        ALEO_CONFIG.TESTNET_URL,
        this.keyProvider,
        this.recordProvider
      );
    } catch (error) {
      console.error('Failed to initialize Aleo provider:', error);
    }
  }

  /**
   * Connect to an Aleo wallet (browser extension or injected wallet)
   * @returns The connected wallet address
   */
  async connectWallet(): Promise<string> {
    const wallet = this.detectWallet();
    if (!wallet) {
      throw new Error('No Aleo wallet found. Please install Leo Wallet or another Aleo-compatible wallet.');
    }

    try {
      const response = await wallet.request({ method: 'connect' });
      const address = response as string;
      
      // Create account from connected wallet
      const privateKey = await this.getPrivateKey();
      this.account = Account.fromPrivateKey(privateKey);
      await this.initializeProvider();
      
      return address;
    } catch (error) {
      throw new Error(`Failed to connect to Aleo wallet: ${error}`);
    }
  }

  /**
   * Detect available Aleo wallets in the browser
   * @returns The detected wallet object or null
   */
  private detectWallet(): AleoWallet | null {
    if (window.leoWallet) {
      return window.leoWallet;
    }
    if (window.aleo) {
      return window.aleo;
    }
    return null;
  }

  /**
   * Check if an Aleo wallet is available
   * @returns True if wallet is available, false otherwise
   */
  isWalletAvailable(): boolean {
    return !!(window.leoWallet || window.aleo);
  }

  /**
   * Get the current connected wallet address
   * @returns The wallet address or null if not connected
   */
  async getWalletAddress(): Promise<string | null> {
    const wallet = this.detectWallet();
    if (!wallet) return null;

    try {
      const response = await wallet.request({ method: 'getAccount' });
      return response as string;
    } catch {
      return null;
    }
  }

  /**
   * Get private key from connected wallet (for transaction signing)
   * @returns The private key string
   */
  private async getPrivateKey(): Promise<string> {
    const wallet = this.detectWallet();
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    const response = await wallet.request({ method: 'getPrivateKey' });
    return response as string;
  }

  /**
   * Disconnect from the current wallet
   */
  async disconnectWallet(): Promise<void> {
    const wallet = this.detectWallet();
    if (wallet) {
      try {
        await wallet.request({ method: 'disconnect' });
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    
    this.account = null;
    this.keyProvider = null;
    this.recordProvider = null;
    this.programManager = null;
  }

  /**
   * Get the current network client for blockchain queries
   */
  getNetworkClient(): AleoNetworkClient | null {
    return this.networkClient;
  }

  /**
   * Get the program manager for contract interactions
   */
  getProgramManager(): ProgramManager | null {
    return this.programManager;
  }

  /**
   * Get the current account
   */
  getAccount(): Account | null {
    return this.account;
  }

  /**
   * Check if wallet is currently connected
   */
  isConnected(): boolean {
    return !!this.account;
  }

  /**
   * Get current network status
   */
  async getNetworkStatus(): Promise<{ height: number; hash: string } | null> {
    if (!this.networkClient) return null;

    try {
      const latestHeight = await this.networkClient.getLatestHeight();
      const latestBlock = await this.networkClient.getLatestBlock();
      return { 
        height: typeof latestHeight === 'number' ? latestHeight : 0, 
        hash: latestBlock ? latestBlock.header.previous_hash : 'unknown' 
      };
    } catch (error) {
      console.error('Failed to get network status:', error);
      return null;
    }
  }
}

/**
 * Global Aleo provider instance
 */
export const aleoProvider = new AleoProvider();

/**
 * Utility functions for Aleo operations
 */
export const AleoUtils = {
  /**
   * Check if a string is a valid Aleo address
   */
  isValidAddress(address: string): boolean {
    return /^aleo1[a-z0-9]{58}$/.test(address);
  },

  /**
   * Format Aleo address for display (shortened)
   */
  formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  /**
   * Convert credits amount to readable format
   */
  formatCredits(credits: number): string {
    return (credits / 1_000_000).toFixed(6);
  },

  /**
   * Convert readable credits to Aleo credits format
   */
  parseCredits(amount: string): number {
    return Math.floor(parseFloat(amount) * 1_000_000);
  }
};