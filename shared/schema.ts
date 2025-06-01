import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  aleoAddress: text("aleo_address").unique(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  verified: boolean("verified").default(false),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const luxuryItems = pgTable("luxury_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  images: text("images").array().default([]),
  conservationStatus: text("conservation_status"),
  identificationNumber: text("identification_number"),
  certified: boolean("certified").default(false),
  tokenId: text("token_id"),
  contractAddress: text("contract_address"),
  saleType: text("sale_type").notNull().default("fixed"),
  auctionEndTime: timestamp("auction_end_time"),
  currentBid: text("current_bid"),
  totalBids: integer("total_bids").default(0),
  ownerId: integer("owner_id").references(() => users.id),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const itemOwnership = pgTable("item_ownership", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => luxuryItems.id).notNull(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  purchasePrice: text("purchase_price"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  isCurrentOwner: boolean("is_current_owner").default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedBrands: many(brands),
  ownedItems: many(luxuryItems),
  purchases: many(itemOwnership),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  owner: one(users, {
    fields: [brands.ownerId],
    references: [users.id],
  }),
  items: many(luxuryItems),
}));

export const luxuryItemsRelations = relations(luxuryItems, ({ one, many }) => ({
  brand: one(brands, {
    fields: [luxuryItems.brandId],
    references: [brands.id],
  }),
  currentOwner: one(users, {
    fields: [luxuryItems.ownerId],
    references: [users.id],
  }),
  ownershipHistory: many(itemOwnership),
}));

export const itemOwnershipRelations = relations(itemOwnership, ({ one }) => ({
  item: one(luxuryItems, {
    fields: [itemOwnership.itemId],
    references: [luxuryItems.id],
  }),
  owner: one(users, {
    fields: [itemOwnership.ownerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  aleoAddress: true,
  email: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  verified: true,
});

export const insertLuxuryItemSchema = createInsertSchema(luxuryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tokenId: true,
  contractAddress: true,
  totalBids: true,
  currentBid: true,
});

export const insertItemOwnershipSchema = createInsertSchema(itemOwnership).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;
export type LuxuryItem = typeof luxuryItems.$inferSelect;
export type InsertLuxuryItem = z.infer<typeof insertLuxuryItemSchema>;
export type ItemOwnership = typeof itemOwnership.$inferSelect;
export type InsertItemOwnership = z.infer<typeof insertItemOwnershipSchema>;
