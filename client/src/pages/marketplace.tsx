import { useState } from "react";
import { luxuryItems } from "@/data/luxury-items";
import ItemCard from "@/components/item-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/**
 * Marketplace component that displays the main luxury items marketplace
 * with filtering and search functionality.
 */
export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  // Filter items based on search and filters
  const filteredItems = luxuryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesPrice = true;
    if (priceFilter !== "all") {
      const price = parseInt(item.price.replace(/[$,]/g, ""));
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
        <h2 className="text-4xl font-bold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
          Certified Luxury Marketplace
        </h2>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'hsl(var(--zg-muted))' }}>
          Discover authenticated luxury items with blockchain-verified certificates. 
          Every piece comes with immutable proof of authenticity.
        </p>
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* No results message */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
            No items found
          </h3>
          <p style={{ color: 'hsl(var(--zg-muted))' }}>
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </main>
  );
}
