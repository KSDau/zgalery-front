import { users, brands, luxuryItems, itemOwnership, type User, type InsertUser, type Brand, type InsertBrand, type LuxuryItem, type InsertLuxuryItem, type ItemOwnership, type InsertItemOwnership } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAleoAddress(aleoAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Brand management
  getBrand(id: number): Promise<Brand | undefined>;
  getBrandsByOwnerId(ownerId: number): Promise<Brand[]>;
  getAllBrands(): Promise<Brand[]>;
  getBrandByAuthKey(authKey: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand | undefined>;

  // Item management
  getLuxuryItem(id: number): Promise<LuxuryItem | undefined>;
  getItemsByBrandId(brandId: number): Promise<LuxuryItem[]>;
  getAllItems(): Promise<LuxuryItem[]>;
  getItemsByOwnerId(ownerId: number): Promise<LuxuryItem[]>;
  createLuxuryItem(item: InsertLuxuryItem): Promise<LuxuryItem>;
  updateLuxuryItem(id: number, item: Partial<InsertLuxuryItem>): Promise<LuxuryItem | undefined>;
  deleteLuxuryItem(id: number): Promise<boolean>;

  // Ownership management
  createItemOwnership(ownership: InsertItemOwnership): Promise<ItemOwnership>;
  getItemOwnerships(itemId: number): Promise<ItemOwnership[]>;
  getCurrentOwner(itemId: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByAleoAddress(aleoAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.aleoAddress, aleoAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Brand methods
  async getBrand(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand || undefined;
  }

  async getBrandsByOwnerId(ownerId: number): Promise<Brand[]> {
    return await db.select().from(brands).where(eq(brands.ownerId, ownerId));
  }

  async getAllBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async getBrandByAuthKey(authKey: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.authKey, authKey));
    return brand || undefined;
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const [brand] = await db
      .insert(brands)
      .values(insertBrand)
      .returning();
    return brand;
  }

  async updateBrand(id: number, updateData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [brand] = await db
      .update(brands)
      .set(updateData)
      .where(eq(brands.id, id))
      .returning();
    return brand || undefined;
  }

  // Item methods
  async getLuxuryItem(id: number): Promise<LuxuryItem | undefined> {
    const [item] = await db.select().from(luxuryItems).where(eq(luxuryItems.id, id));
    return item || undefined;
  }

  async getItemsByBrandId(brandId: number): Promise<LuxuryItem[]> {
    return await db.select().from(luxuryItems).where(eq(luxuryItems.brandId, brandId));
  }

  async getAllItems(): Promise<LuxuryItem[]> {
    return await db.select().from(luxuryItems);
  }

  async getItemsByOwnerId(ownerId: number): Promise<LuxuryItem[]> {
    return await db.select().from(luxuryItems).where(eq(luxuryItems.ownerId, ownerId));
  }

  async createLuxuryItem(insertItem: InsertLuxuryItem): Promise<LuxuryItem> {
    const [item] = await db
      .insert(luxuryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateLuxuryItem(id: number, updateData: Partial<InsertLuxuryItem>): Promise<LuxuryItem | undefined> {
    const updatedData = { ...updateData, updatedAt: new Date() };
    const [item] = await db
      .update(luxuryItems)
      .set(updatedData)
      .where(eq(luxuryItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteLuxuryItem(id: number): Promise<boolean> {
    const result = await db.delete(luxuryItems).where(eq(luxuryItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Ownership methods
  async createItemOwnership(insertOwnership: InsertItemOwnership): Promise<ItemOwnership> {
    const [ownership] = await db
      .insert(itemOwnership)
      .values(insertOwnership)
      .returning();
    return ownership;
  }

  async getItemOwnerships(itemId: number): Promise<ItemOwnership[]> {
    return await db.select().from(itemOwnership).where(eq(itemOwnership.itemId, itemId));
  }

  async getCurrentOwner(itemId: number): Promise<User | undefined> {
    const [ownership] = await db
      .select()
      .from(itemOwnership)
      .leftJoin(users, eq(itemOwnership.ownerId, users.id))
      .where(and(
        eq(itemOwnership.itemId, itemId),
        eq(itemOwnership.isCurrentOwner, true)
      ));
    
    return ownership?.users || undefined;
  }
}

export const storage = new DatabaseStorage();
