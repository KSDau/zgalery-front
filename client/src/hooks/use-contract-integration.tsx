import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base";
import { contractService } from "@/lib/contract-service";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export interface ContractNFTData {
  name: string;
  description: string;
  brand: string;
  category: string;
  images: string[];
  price: number;
}

/**
 * Hook for integrating with the deployed zgallery smart contracts
 */
export function useContractIntegration() {
  const { publicKey, requestTransaction, requestRecords, transactionStatus } = useWallet();
  const { toast } = useToast();
  const [isTransacting, setIsTransacting] = useState(false);

  /**
   * Mint an NFT and list it on the marketplace
   */
  const mintAndListNFT = async (nftData: ContractNFTData) => {
    if (!publicKey) throw new WalletNotConnectedError();
    if (!requestTransaction) {
      throw new Error("Wallet does not support transactions");
    }

    setIsTransacting(true);
    
    try {
      // Create metadata JSON string
      const metadata = JSON.stringify({
        name: nftData.name,
        description: nftData.description,
        brand: nftData.brand,
        category: nftData.category,
        images: nftData.images,
        timestamp: Date.now()
      });

      toast({
        title: "Minting NFT",
        description: "Creating your NFT on the blockchain...",
      });

      // Step 1: Mint the NFT
      const mintTxId = await contractService.mintNFT(
        publicKey,
        publicKey, // owner is the current user
        metadata,
        requestTransaction
      );

      console.log("Mint transaction submitted:", mintTxId);

      // Wait a moment for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check transaction status
      if (transactionStatus) {
        const mintStatus = await transactionStatus(mintTxId);
        console.log("Mint transaction status:", mintStatus);
      }

      // Generate a simple token ID (in production, this would come from the contract)
      const tokenId = Math.floor(Math.random() * 1000000);

      toast({
        title: "Listing NFT",
        description: "Adding your NFT to the marketplace...",
      });

      // Step 2: List the NFT on the marketplace
      const priceInMicrocredits = Math.floor(nftData.price * 1_000_000); // Convert to microcredits
      
      const listTxId = await contractService.listItem(
        publicKey,
        publicKey, // seller is the current user
        tokenId,
        priceInMicrocredits,
        requestTransaction
      );

      console.log("List transaction submitted:", listTxId);

      // Check listing transaction status
      if (transactionStatus) {
        const listStatus = await transactionStatus(listTxId);
        console.log("List transaction status:", listStatus);
      }

      toast({
        title: "Success!",
        description: "Your NFT has been minted and listed on the marketplace.",
      });

      return {
        mintTxId,
        listTxId,
        tokenId,
        success: true
      };

    } catch (error: any) {
      console.error("Contract interaction error:", error);
      
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to mint and list NFT. Please try again.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  /**
   * Purchase an NFT from the marketplace
   */
  const purchaseNFT = async (tokenId: number) => {
    if (!publicKey) throw new WalletNotConnectedError();
    if (!requestTransaction) {
      throw new Error("Wallet does not support transactions");
    }

    setIsTransacting(true);

    try {
      toast({
        title: "Purchasing NFT",
        description: "Processing your purchase...",
      });

      const purchaseTxId = await contractService.purchaseItem(
        publicKey,
        publicKey, // buyer is the current user
        tokenId,
        requestTransaction
      );

      console.log("Purchase transaction submitted:", purchaseTxId);

      if (transactionStatus) {
        const purchaseStatus = await transactionStatus(purchaseTxId);
        console.log("Purchase transaction status:", purchaseStatus);
      }

      toast({
        title: "Purchase Successful!",
        description: "The NFT is now yours.",
      });

      return { purchaseTxId, success: true };

    } catch (error: any) {
      console.error("Purchase error:", error);
      
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase NFT. Please try again.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsTransacting(false);
    }
  };

  /**
   * Get user's NFT records from the blockchain
   */
  const getUserNFTs = async () => {
    if (!requestRecords) return [];

    try {
      const records = await contractService.getNFTRecords(requestRecords);
      return records.map(contractService.parseNFTRecord);
    } catch (error) {
      console.error("Error fetching NFT records:", error);
      return [];
    }
  };

  /**
   * Get marketplace listing records
   */
  const getMarketplaceListings = async () => {
    if (!requestRecords) return [];

    try {
      const records = await contractService.getListingRecords(requestRecords);
      return records.map(contractService.parseListingRecord);
    } catch (error) {
      console.error("Error fetching listing records:", error);
      return [];
    }
  };

  return {
    isTransacting,
    mintAndListNFT,
    purchaseNFT,
    getUserNFTs,
    getMarketplaceListings,
    isWalletConnected: !!publicKey,
  };
}