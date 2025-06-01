import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBrandSchema, insertLuxuryItemSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Brand routes
  app.get("/api/brands", async (req: Request, res: Response) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const brand = await storage.getBrand(id);
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  });

  app.post("/api/brands", async (req: Request, res: Response) => {
    try {
      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(brandData);
      res.status(201).json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid brand data", details: error.errors });
      }
      console.error("Error creating brand:", error);
      res.status(500).json({ error: "Failed to create brand" });
    }
  });

  app.post("/api/brands/auth", async (req: Request, res: Response) => {
    try {
      const { authKey } = req.body;
      if (!authKey) {
        return res.status(400).json({ error: "Authentication key is required" });
      }
      
      const brand = await storage.getBrandByAuthKey(authKey);
      if (!brand) {
        return res.status(401).json({ error: "Invalid authentication key" });
      }
      
      res.json(brand);
    } catch (error: any) {
      console.error("Error authenticating brand:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.get("/api/brands/:id/items", async (req: Request, res: Response) => {
    try {
      const brandId = parseInt(req.params.id);
      const items = await storage.getItemsByBrandId(brandId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching brand items:", error);
      res.status(500).json({ error: "Failed to fetch brand items" });
    }
  });

  // Item routes
  app.get("/api/items", async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getLuxuryItem(id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  app.post("/api/items", async (req: Request, res: Response) => {
    try {
      const itemData = insertLuxuryItemSchema.parse(req.body);
      const item = await storage.createLuxuryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid item data", details: error.errors });
      }
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.put("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertLuxuryItemSchema.partial().parse(req.body);
      const item = await storage.updateLuxuryItem(id, updateData);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid item data", details: error.errors });
      }
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLuxuryItem(id);
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // User routes
  app.get("/api/users/:aleoAddress", async (req: Request, res: Response) => {
    try {
      const aleoAddress = req.params.aleoAddress;
      const user = await storage.getUserByAleoAddress(aleoAddress);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/:id/brands", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const brands = await storage.getBrandsByOwnerId(userId);
      res.json(brands);
    } catch (error) {
      console.error("Error fetching user brands:", error);
      res.status(500).json({ error: "Failed to fetch user brands" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
