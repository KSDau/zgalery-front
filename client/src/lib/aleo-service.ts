import { apiRequest } from '@/lib/queryClient';
import { zgalleryContracts } from '@/lib/contracts';
import type { NFT, Listing, Receipt, LuxuryItem } from '@shared/schema';

/**
 * Service layer for integrating Aleo blockchain operations with the frontend
 * Provides a unified interface for both mock data and real blockchain interactions
 */
export class AleoMarketplaceService {
  private useBlockchain: boolean;

  constructor(useBlockchain: boolean = false) {
    this.useBlockchain = useBlockchain;
  }

  /**
   * Create and mint a new NFT from luxury item data
   */
  async mintLuxuryItemAsNFT(itemData: {
    name: string;
    description: string;
    category: string;
    brand: string;
    price: string;
    images: string[];
    owner: string;
  }): Promise<NFT> {
    const metadata = JSON.stringify({
      name: itemData.name,
      description: itemData.description,
      images: itemData.images,
      price: itemData.price
    });

    const nftData = {
      owner: itemData.owner,
      metadata,
      brand: itemData.brand,
      form: itemData.category.toLowerCase(),
      edition: this.generateEdition(),
      nftCommit: this.generateCommitment(),
      isPrivate: true
    };

    if (this.useBlockchain) {
      // Real blockchain minting would happen here
      const contractNftData = zgalleryContracts.createNFTData({
        name: itemData.name,
        brand: itemData.brand,
        description: itemData.description,
        category: itemData.category
      });
      
      await zgalleryContracts.mintNFT(contractNftData);
    }

    // Store in backend database
    return await apiRequest('/api/nfts', {
      method: 'POST',
      body: JSON.stringify(nftData),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * List an NFT for sale in the marketplace
   */
  async listNFTForSale(nftCommit: string, price: number, seller: string): Promise<Listing> {
    const listingData = {
      listingId: this.generateListingId(),
      nftCommit,
      seller,
      price: this.parseCreditsToMicrocredits(price),
      listingPublicKey: this.generatePublicKey(),
      purchased: false,
      approved: false
    };

    if (this.useBlockchain) {
      // Real blockchain listing would happen here
      const nft = await this.getNFTByCommit(nftCommit);
      if (nft) {
        await zgalleryContracts.listNFT(nft as any, price);
      }
    }

    return await apiRequest('/api/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Purchase an NFT from the marketplace
   */
  async purchaseNFT(listingId: string, buyer: string, price: number): Promise<{ receipt: Receipt; success: boolean }> {
    if (this.useBlockchain) {
      // Real blockchain purchase would happen here
      const listing = await this.getListingByListingId(listingId);
      if (listing) {
        const result = await zgalleryContracts.purchaseNFT(listing.nftCommit, price, buyer);
        
        if (result.success) {
          // Update listing as purchased
          await this.updateListing(listingId, {
            purchased: true,
            buyer,
            buyerCommit: this.generateCommitment(),
            purchaseN: this.generateNonce()
          });
        }
      }
    }

    // Create receipt
    const receipt = await apiRequest('/api/receipts', {
      method: 'POST',
      body: JSON.stringify({
        receiptType: 'buyer',
        owner: buyer,
        listingId,
        seller: await this.getSellerByListingId(listingId)
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    return { receipt, success: true };
  }

  /**
   * Get all active marketplace listings
   */
  async getActiveListings(): Promise<Listing[]> {
    return await apiRequest('/api/listings');
  }

  /**
   * Get NFTs owned by a specific address
   */
  async getNFTsByOwner(owner: string): Promise<NFT[]> {
    return await apiRequest(`/api/nfts/owner/${owner}`);
  }

  /**
   * Get listings by seller
   */
  async getListingsBySeller(seller: string): Promise<Listing[]> {
    return await apiRequest(`/api/listings/seller/${seller}`);
  }

  /**
   * Get receipts for a user
   */
  async getReceiptsByOwner(owner: string): Promise<Receipt[]> {
    return await apiRequest(`/api/receipts/owner/${owner}`);
  }

  /**
   * Get legacy luxury items (for development)
   */
  async getLuxuryItems(): Promise<LuxuryItem[]> {
    return await apiRequest('/api/luxury-items');
  }

  /**
   * Create a luxury item (development mode)
   */
  async createLuxuryItem(itemData: any): Promise<LuxuryItem> {
    return await apiRequest('/api/luxury-items', {
      method: 'POST',
      body: JSON.stringify(itemData),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Private helper methods
  private async getNFTByCommit(nftCommit: string): Promise<NFT | null> {
    try {
      return await apiRequest(`/api/nfts/commit/${nftCommit}`);
    } catch {
      return null;
    }
  }

  private async getListingByListingId(listingId: string): Promise<Listing | null> {
    try {
      const listings = await apiRequest('/api/listings');
      return listings.find((l: Listing) => l.listingId === listingId) || null;
    } catch {
      return null;
    }
  }

  private async getSellerByListingId(listingId: string): Promise<string> {
    const listing = await this.getListingByListingId(listingId);
    return listing?.seller || '';
  }

  private async updateListing(listingId: string, updates: Partial<Listing>): Promise<void> {
    // This would be implemented when we add the PATCH endpoint
    console.log('Update listing:', listingId, updates);
  }

  private generateEdition(): string {
    return `edition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCommitment(): string {
    return `commit_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
  }

  private generateListingId(): string {
    return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePublicKey(): string {
    return `pubkey_${Math.random().toString(36).substr(2, 20)}`;
  }

  private generateNonce(): string {
    return `nonce_${Math.random().toString(36).substr(2, 10)}`;
  }

  private parseCreditsToMicrocredits(credits: number): number {
    return Math.floor(credits * 1_000_000);
  }

  private formatMicrocreditsToCredits(microcredits: number): number {
    return microcredits / 1_000_000;
  }
}

/**
 * Global service instance
 * Set useBlockchain to true when contracts are deployed
 */
export const aleoMarketplace = new AleoMarketplaceService(false);