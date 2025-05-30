import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const luxuryItems = pgTable("luxury_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  certified: boolean("certified").notNull().default(true),
  tokenId: text("token_id").notNull(),
  contractAddress: text("contract_address").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLuxuryItemSchema = createInsertSchema(luxuryItems).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LuxuryItem = typeof luxuryItems.$inferSelect;
export type InsertLuxuryItem = z.infer<typeof insertLuxuryItemSchema>;
