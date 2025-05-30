declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (data: unknown) => void) => void;
      removeListener: (event: string, callback: (data: unknown) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

/**
 * Web3 utility functions for connecting to MetaMask and managing wallet interactions.
 * Provides a simple interface for wallet connection and disconnection.
 */

/**
 * Connects to MetaMask wallet and returns the connected account address.
 * @returns {Promise<string>} The connected wallet address
 * @throws {Error} If MetaMask is not installed or connection fails
 */
export async function connectToMetaMask(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Web3 is only available in the browser");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please make sure MetaMask is unlocked.");
    }

    return accounts[0];
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("User rejected")) {
        throw new Error("Connection rejected by user");
      }
      throw error;
    }
    throw new Error("Failed to connect to MetaMask");
  }
}

/**
 * Checks if MetaMask is installed in the current browser.
 * @returns {boolean} True if MetaMask is available, false otherwise
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask === true;
}

/**
 * Gets the current connected accounts from MetaMask.
 * @returns {Promise<string[]>} Array of connected account addresses
 */
export async function getConnectedAccounts(): Promise<string[]> {
  if (!window.ethereum) {
    return [];
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    }) as string[];
    return accounts || [];
  } catch (error) {
    console.error("Error getting connected accounts:", error);
    return [];
  }
}

/**
 * Disconnects the wallet by clearing local state.
 * Note: MetaMask doesn't provide a programmatic way to disconnect,
 * so this function mainly clears the local application state.
 */
export function disconnectWallet(): void {
  // MetaMask doesn't provide a programmatic disconnect method
  // This function exists for consistency and future extensibility
  console.log("Wallet disconnected locally");
}

/**
 * Gets the current network/chain ID from MetaMask.
 * @returns {Promise<string>} The current chain ID
 */
export async function getCurrentChainId(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available");
  }

  try {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    }) as string;
    return chainId;
  } catch (error) {
    console.error("Error getting chain ID:", error);
    throw new Error("Failed to get current network");
  }
}

/**
 * Switches to a specific network in MetaMask.
 * @param {string} chainId - The chain ID to switch to (in hex format)
 */
export async function switchNetwork(chainId: string): Promise<void> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (error) {
    console.error("Error switching network:", error);
    throw new Error("Failed to switch network");
  }
}
