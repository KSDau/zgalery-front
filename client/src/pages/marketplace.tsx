import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ItemCard from "@/components/item-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useLocation } from "wouter";
import type { Listing, NFT } from "@shared/schema";

/**
 * Marketplace component that displays the main luxury items marketplace
 * with filtering and search functionality.
 */
export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [, setLocation] = useLocation();

  // Fetch active listings from API
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/listings'],
    queryFn: async () => {
      const response = await fetch('/api/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    }
  });

  // Fetch NFT data for each listing
  const { data: nfts = [], isLoading: nftsLoading } = useQuery({
    queryKey: ['/api/nfts', listings.map((l: any) => l.nftCommit)],
    queryFn: async () => {
      const nftPromises = listings.map(async (listing: any) => {
        try {
          const response = await fetch(`/api/nfts/commit/${listing.nftCommit}`);
          if (!response.ok) return null;
          return response.json();
        } catch {
          return null;
        }
      });
      const results = await Promise.all(nftPromises);
      return results.filter((nft: any) => nft !== null);
    },
    enabled: listings.length > 0
  });

  // Transform listings and NFTs into marketplace items
  const marketplaceItems = listings.map((listing: any) => {
    const nft = nfts.find((n: any) => n.nftCommit === listing.nftCommit);
    if (!nft) return null;

    const metadata = JSON.parse(nft.metadata || '{}');
    const priceInCredits = (listing.price / 1_000_000).toFixed(2);

    return {
      id: listing.id,
      name: metadata.name || 'Unnamed Item',
      price: `$${priceInCredits}`,
      image: metadata.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800',
      description: metadata.description || 'No description available',
      category: nft.form || 'collectibles',
      brand: nft.brand,
      certified: true,
      tokenId: nft.edition,
      contractAddress: nft.nftCommit || '',
      saleType: "fixed",
    };
  }).filter((item: any) => item !== null);

  // Filter items based on search and filters
  const filteredItems = marketplaceItems.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesPrice = true;
    if (priceFilter !== "all") {
      const price = parseFloat(item.price.replace(/[$,]/g, ""));
      switch (priceFilter) {
        case "under-10k":
          matchesPrice = price < 10000;
          break;
        case "10k-50k":
          matchesPrice = price >= 10000 && price <= 50000;
          break;
        case "over-50k":
          matchesPrice = price > 50000;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
              Certified Luxury Marketplace
            </h2>
            <p className="text-xl max-w-2xl" style={{ color: 'hsl(var(--zg-muted))' }}>
              Discover authenticated luxury items with blockchain-verified certificates. 
              Every piece comes with immutable proof of authenticity.
            </p>
          </div>
          <Button 
            onClick={() => setLocation("/sell")}
            className="px-6 py-3 text-lg font-semibold"
            style={{ 
              backgroundColor: 'hsl(var(--zg-primary))',
              color: 'hsl(var(--zg-bg))'
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Sell Item
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex space-x-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48" style={{ backgroundColor: 'hsl(var(--zg-secondary))', borderColor: 'hsl(var(--zg-border))' }}>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="watches">Watches</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-48" style={{ backgroundColor: 'hsl(var(--zg-secondary))', borderColor: 'hsl(var(--zg-border))' }}>
              <SelectValue placeholder="Price: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Price: All</SelectItem>
              <SelectItem value="under-10k">Under $10k</SelectItem>
              <SelectItem value="10k-50k">$10k - $50k</SelectItem>
              <SelectItem value="over-50k">Over $50k</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4" style={{ color: 'hsl(var(--zg-muted))' }} />
          <Input
            type="text"
            placeholder="Search luxury items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
            style={{ 
              backgroundColor: 'hsl(var(--zg-secondary))', 
              borderColor: 'hsl(var(--zg-border))'
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {(listingsLoading || nftsLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items Grid */}
      {!listingsLoading && !nftsLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item: any) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* No results message */}
          {filteredItems.length === 0 && marketplaceItems.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
                No items listed yet
              </h3>
              <p style={{ color: 'hsl(var(--zg-muted))' }} className="mb-4">
                Be the first to list a luxury item in the marketplace.
              </p>
              <Button 
                onClick={() => setLocation('/sell')}
                style={{ 
                  backgroundColor: 'hsl(var(--zg-primary))',
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                List an Item
              </Button>
            </div>
          )}

          {/* Filtered results empty */}
          {filteredItems.length === 0 && marketplaceItems.length > 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
                No items match your filters
              </h3>
              <p style={{ color: 'hsl(var(--zg-muted))' }}>
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
