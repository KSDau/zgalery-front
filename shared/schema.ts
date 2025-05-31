import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  aleoAddress: text("aleo_address").unique(), // Aleo wallet address
});

// NFT table matching Aleo contract structure
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  owner: text("owner").notNull(), // Aleo address
  metadata: text("metadata").notNull(), // JSON string containing item details
  brand: text("brand").notNull(), // Brand identifier
  form: text("form").notNull(), // Category/form of the item
  edition: text("edition").notNull(), // Unique edition identifier
  nftCommit: text("nft_commit").unique(), // Commitment hash for the NFT
  isPrivate: boolean("is_private").default(true), // Private/public state
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace listings table
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  listingId: text("listing_id").unique().notNull(), // Aleo contract listing ID
  nftCommit: text("nft_commit").notNull(), // Reference to NFT
  seller: text("seller").notNull(), // Seller's Aleo address
  price: integer("price").notNull(), // Price in Aleo credits (microcredits)
  listingPublicKey: text("listing_public_key").notNull(), // Public key for listing
  purchased: boolean("purchased").default(false),
  approved: boolean("approved").default(false),
  buyerCommit: text("buyer_c"), // Buyer commitment if purchased
  purchaseN: text("purchase_N"), // Purchase nonce if purchased
  buyer: text("buyer"), // Buyer's address if purchased
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Receipt table for tracking transactions
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  receiptType: text("receipt_type").notNull(), // "seller" | "buyer"
  owner: text("owner").notNull(), // Receipt owner's address
  listingId: text("listing_id").notNull(), // Associated listing ID
  seller: text("seller"), // Seller address (for buyer receipts)
  listingPrivateKey: text("listing_private_key"), // Private key (for seller receipts)
  transactionHash: text("transaction_hash"), // Blockchain transaction hash
  createdAt: timestamp("created_at").defaultNow(),
});

// Legacy luxury items table (maintained for development)
export const luxuryItems = pgTable("luxury_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  certified: boolean("certified").notNull().default(true),
  tokenId: text("token_id").notNull(),
  contractAddress: text("contract_address").notNull(),
  saleType: text("sale_type").default("fixed"), // "fixed" | "auction"
  auctionEndTime: timestamp("auction_end_time"),
  currentBid: text("current_bid"),
  totalBids: integer("total_bids").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema definitions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  aleoAddress: true,
});

export const insertNFTSchema = createInsertSchema(nfts).omit({
  id: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  createdAt: true,
});

export const insertLuxuryItemSchema = createInsertSchema(luxuryItems).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNFT = z.infer<typeof insertNFTSchema>;
export type NFT = typeof nfts.$inferSelect;

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;

export type LuxuryItem = typeof luxuryItems.$inferSelect;
export type InsertLuxuryItem = z.infer<typeof insertLuxuryItemSchema>;
