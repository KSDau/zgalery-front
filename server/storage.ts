import { 
  users, type User, type InsertUser,
  type NFT, type InsertNFT,
  type Listing, type InsertListing,
  type Receipt, type InsertReceipt,
  type LuxuryItem, type InsertLuxuryItem 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAleoAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // NFT operations
  getNFT(id: number): Promise<NFT | undefined>;
  getNFTByCommit(nftCommit: string): Promise<NFT | undefined>;
  getNFTsByOwner(owner: string): Promise<NFT[]>;
  createNFT(nft: InsertNFT): Promise<NFT>;
  updateNFTOwner(nftCommit: string, newOwner: string): Promise<void>;
  
  // Listing operations
  getListing(id: number): Promise<Listing | undefined>;
  getListingByListingId(listingId: string): Promise<Listing | undefined>;
  getAllActiveListings(): Promise<Listing[]>;
  getListingsBySeller(seller: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(listingId: string, updates: Partial<Listing>): Promise<void>;
  
  // Receipt operations
  getReceipt(id: number): Promise<Receipt | undefined>;
  getReceiptsByOwner(owner: string): Promise<Receipt[]>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  
  // Legacy luxury items (maintained for development)
  getLuxuryItem(id: number): Promise<LuxuryItem | undefined>;
  getAllLuxuryItems(): Promise<LuxuryItem[]>;
  createLuxuryItem(item: InsertLuxuryItem): Promise<LuxuryItem>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private nfts: Map<number, NFT>;
  private listings: Map<number, Listing>;
  private receipts: Map<number, Receipt>;
  private luxuryItems: Map<number, LuxuryItem>;
  
  private userIdCounter: number;
  private nftIdCounter: number;
  private listingIdCounter: number;
  private receiptIdCounter: number;
  private luxuryItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.nfts = new Map();
    this.listings = new Map();
    this.receipts = new Map();
    this.luxuryItems = new Map();
    
    this.userIdCounter = 1;
    this.nftIdCounter = 1;
    this.listingIdCounter = 1;
    this.receiptIdCounter = 1;
    this.luxuryItemIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByAleoAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.aleoAddress === address,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // NFT operations
  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nfts.get(id);
  }

  async getNFTByCommit(nftCommit: string): Promise<NFT | undefined> {
    return Array.from(this.nfts.values()).find(nft => nft.nftCommit === nftCommit);
  }

  async getNFTsByOwner(owner: string): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter(nft => nft.owner === owner);
  }

  async createNFT(insertNFT: InsertNFT): Promise<NFT> {
    const id = this.nftIdCounter++;
    const nft: NFT = { 
      ...insertNFT, 
      id,
      createdAt: new Date()
    };
    this.nfts.set(id, nft);
    return nft;
  }

  async updateNFTOwner(nftCommit: string, newOwner: string): Promise<void> {
    for (const [id, nft] of this.nfts.entries()) {
      if (nft.nftCommit === nftCommit) {
        this.nfts.set(id, { ...nft, owner: newOwner });
        return;
      }
    }
  }

  // Listing operations
  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getListingByListingId(listingId: string): Promise<Listing | undefined> {
    return Array.from(this.listings.values()).find(listing => listing.listingId === listingId);
  }

  async getAllActiveListings(): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(listing => 
      !listing.purchased && !listing.approved
    );
  }

  async getListingsBySeller(seller: string): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(listing => listing.seller === seller);
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.listingIdCounter++;
    const listing: Listing = { 
      ...insertListing, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.listings.set(id, listing);
    return listing;
  }

  async updateListing(listingId: string, updates: Partial<Listing>): Promise<void> {
    for (const [id, listing] of this.listings.entries()) {
      if (listing.listingId === listingId) {
        this.listings.set(id, { 
          ...listing, 
          ...updates, 
          updatedAt: new Date() 
        });
        return;
      }
    }
  }

  // Receipt operations
  async getReceipt(id: number): Promise<Receipt | undefined> {
    return this.receipts.get(id);
  }

  async getReceiptsByOwner(owner: string): Promise<Receipt[]> {
    return Array.from(this.receipts.values()).filter(receipt => receipt.owner === owner);
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = this.receiptIdCounter++;
    const receipt: Receipt = { 
      ...insertReceipt, 
      id,
      createdAt: new Date()
    };
    this.receipts.set(id, receipt);
    return receipt;
  }

  // Legacy luxury items operations
  async getLuxuryItem(id: number): Promise<LuxuryItem | undefined> {
    return this.luxuryItems.get(id);
  }

  async getAllLuxuryItems(): Promise<LuxuryItem[]> {
    return Array.from(this.luxuryItems.values());
  }

  async createLuxuryItem(insertItem: InsertLuxuryItem): Promise<LuxuryItem> {
    const id = this.luxuryItemIdCounter++;
    const item: LuxuryItem = { 
      ...insertItem, 
      id,
      createdAt: new Date()
    };
    this.luxuryItems.set(id, item);
    return item;
  }
}

export const storage = new MemStorage();
