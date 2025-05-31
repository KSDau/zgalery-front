import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";

/**
 * Real contract integration service for zgallery smart contracts
 * Uses actual deployed contracts on Aleo Testnet 3
 */
export class ZgalleryContractService {
  private readonly NFT_PROGRAM = "zgallery_nft.aleo";
  private readonly MARKETPLACE_PROGRAM = "zgallery_marketplace.aleo";
  private readonly NETWORK = WalletAdapterNetwork.Testnet;

  /**
   * Mint a new NFT using the deployed contract
   */
  async mintNFT(
    publicKey: string,
    owner: string,
    metadata: string,
    requestTransaction: (transaction: Transaction) => Promise<string>
  ): Promise<string> {
    const inputs = [owner, `"${metadata}"`];
    const fee = 100_000; // 0.1 credits

    const transaction = Transaction.createTransaction(
      publicKey,
      this.NETWORK,
      this.NFT_PROGRAM,
      "mint",
      inputs,
      fee
    );

    return await requestTransaction(transaction);
  }

  /**
   * List an NFT for sale on the marketplace
   */
  async listItem(
    publicKey: string,
    seller: string,
    tokenId: number,
    price: number,
    requestTransaction: (transaction: Transaction) => Promise<string>
  ): Promise<string> {
    const inputs = [seller, `${tokenId}u64`, `${price}u64`];
    const fee = 50_000; // 0.05 credits

    const transaction = Transaction.createTransaction(
      publicKey,
      this.NETWORK,
      this.MARKETPLACE_PROGRAM,
      "list_item",
      inputs,
      fee
    );

    return await requestTransaction(transaction);
  }

  /**
   * Purchase an NFT from the marketplace
   */
  async purchaseItem(
    publicKey: string,
    buyer: string,
    tokenId: number,
    requestTransaction: (transaction: Transaction) => Promise<string>
  ): Promise<string> {
    const inputs = [buyer, `${tokenId}u64`];
    const fee = 75_000; // 0.075 credits

    const transaction = Transaction.createTransaction(
      publicKey,
      this.NETWORK,
      this.MARKETPLACE_PROGRAM,
      "purchase_item",
      inputs,
      fee
    );

    return await requestTransaction(transaction);
  }

  /**
   * Cancel a marketplace listing
   */
  async cancelListing(
    publicKey: string,
    seller: string,
    tokenId: number,
    requestTransaction: (transaction: Transaction) => Promise<string>
  ): Promise<string> {
    const inputs = [seller, `${tokenId}u64`];
    const fee = 25_000; // 0.025 credits

    const transaction = Transaction.createTransaction(
      publicKey,
      this.NETWORK,
      this.MARKETPLACE_PROGRAM,
      "cancel_listing",
      inputs,
      fee
    );

    return await requestTransaction(transaction);
  }

  /**
   * Update the price of a listed item
   */
  async updatePrice(
    publicKey: string,
    seller: string,
    tokenId: number,
    newPrice: number,
    requestTransaction: (transaction: Transaction) => Promise<string>
  ): Promise<string> {
    const inputs = [seller, `${tokenId}u64`, `${newPrice}u64`];
    const fee = 30_000; // 0.03 credits

    const transaction = Transaction.createTransaction(
      publicKey,
      this.NETWORK,
      this.MARKETPLACE_PROGRAM,
      "update_price",
      inputs,
      fee
    );

    return await requestTransaction(transaction);
  }

  /**
   * Get records for a specific program
   */
  async getRecords(
    program: string,
    requestRecords: (program: string) => Promise<any[]>
  ): Promise<any[]> {
    return await requestRecords(program);
  }

  /**
   * Get NFT records for a user
   */
  async getNFTRecords(
    requestRecords: (program: string) => Promise<any[]>
  ): Promise<any[]> {
    return await this.getRecords(this.NFT_PROGRAM, requestRecords);
  }

  /**
   * Get marketplace listing records
   */
  async getListingRecords(
    requestRecords: (program: string) => Promise<any[]>
  ): Promise<any[]> {
    return await this.getRecords(this.MARKETPLACE_PROGRAM, requestRecords);
  }

  /**
   * Parse NFT record data
   */
  parseNFTRecord(record: any) {
    return {
      owner: record.data.owner,
      metadata: record.data.metadata,
      tokenId: record.data.token_id
    };
  }

  /**
   * Parse listing record data
   */
  parseListingRecord(record: any) {
    return {
      seller: record.data.seller,
      tokenId: record.data.token_id,
      price: record.data.price
    };
  }
}

export const contractService = new ZgalleryContractService();