import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertNFTSchema, insertListingSchema, insertReceiptSchema, insertLuxuryItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ message: "ZGallery server is running!" });
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.get("/api/users/aleo/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const user = await storage.getUserByAleoAddress(address);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user by Aleo address" });
    }
  });

  // NFT routes
  app.post("/api/nfts", async (req, res) => {
    try {
      const nftData = insertNFTSchema.parse(req.body);
      const nft = await storage.createNFT(nftData);
      res.json(nft);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid NFT data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create NFT" });
      }
    }
  });

  app.get("/api/nfts/owner/:owner", async (req, res) => {
    try {
      const owner = req.params.owner;
      const nfts = await storage.getNFTsByOwner(owner);
      res.json(nfts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get NFTs by owner" });
    }
  });

  // Listing routes
  app.post("/api/listings", async (req, res) => {
    try {
      const listingData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(listingData);
      res.json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid listing data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create listing" });
      }
    }
  });

  app.get("/api/listings", async (req, res) => {
    try {
      const listings = await storage.getAllActiveListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get listings" });
    }
  });

  app.get("/api/listings/seller/:seller", async (req, res) => {
    try {
      const seller = req.params.seller;
      const listings = await storage.getListingsBySeller(seller);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get listings by seller" });
    }
  });

  // Receipt routes
  app.post("/api/receipts", async (req, res) => {
    try {
      const receiptData = insertReceiptSchema.parse(req.body);
      const receipt = await storage.createReceipt(receiptData);
      res.json(receipt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid receipt data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create receipt" });
      }
    }
  });

  app.get("/api/receipts/owner/:owner", async (req, res) => {
    try {
      const owner = req.params.owner;
      const receipts = await storage.getReceiptsByOwner(owner);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get receipts by owner" });
    }
  });

  // Legacy luxury items routes (maintained for development)
  app.get("/api/luxury-items", async (req, res) => {
    try {
      const items = await storage.getAllLuxuryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to get luxury items" });
    }
  });

  app.post("/api/luxury-items", async (req, res) => {
    try {
      const itemData = insertLuxuryItemSchema.parse(req.body);
      const item = await storage.createLuxuryItem(itemData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid item data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create luxury item" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
