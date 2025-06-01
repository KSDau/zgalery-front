import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  Edit, 
  Users, 
  TrendingUp, 
  Package,
  Search,
  Filter,
  Building2,
  Mail,
  MessageCircle,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Brand, LuxuryItem } from "@shared/schema";

/**
 * CreatorDashboard component that allows brands to manage their luxury items,
 * view brand analytics, and mint new items from collections.
 */
export default function CreatorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [selectedOwnerId] = useState(3); // Mock authenticated user ID

  // Fetch brands data
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Fetch items data
  const { data: items = [], isLoading: itemsLoading } = useQuery<LuxuryItem[]>({
    queryKey: ["/api/items"],
  });

  const userBrands = brands.filter((brand: Brand) => brand.ownerId === selectedOwnerId);

  const filteredItems = items.filter((item: LuxuryItem) => {
    const itemBrand = brands.find((brand: Brand) => brand.id === item.brandId);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === "all" || 
                        (itemBrand && itemBrand.id.toString() === brandFilter);
    const isUserItem = itemBrand && itemBrand.ownerId === selectedOwnerId;
    
    return matchesSearch && matchesBrand && isUserItem;
  });

  const userItems = items.filter((item: LuxuryItem) => {
    const itemBrand = brands.find((brand: Brand) => brand.id === item.brandId);
    return itemBrand && itemBrand.ownerId === selectedOwnerId;
  });

  const activeItems = userItems.filter((item: LuxuryItem) => item.status === "listed").length;
  const soldItems = userItems.filter((item: LuxuryItem) => item.status === "sold").length;

  const totalValue = userItems.reduce((sum, item: LuxuryItem) => {
    const price = parseFloat(item.price.replace(/[$,]/g, ""));
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const conversionRate = userItems.length > 0 ? (soldItems / userItems.length) * 100 : 0;

  if (brandsLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/marketplace")}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Creator Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your brands and luxury items</p>
            </div>
          </div>
          
          <Button 
            className="bg-black hover:bg-gray-800 text-white"
            onClick={() => setLocation("/mint-collection")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Mint Item from Collection
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userItems.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeItems} active, {soldItems} sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {userBrands.length} brands
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {soldItems} of {userItems.length} items sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBrands.length}</div>
              <p className="text-xs text-muted-foreground">
                Verified brands
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="h-10 items-center justify-center rounded-md bg-muted p-1 grid w-full grid-cols-3 text-[#f9fafb]">
            <TabsTrigger value="items">My Items</TabsTrigger>
            <TabsTrigger value="brands">My Brands</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All My Brands</SelectItem>
                  {userBrands.map((brand: Brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Luxury Items ({filteredItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Certified</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {userItems.length === 0 
                            ? "No items found. Start by minting items from your collections."
                            : "No items match your search criteria."
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item: LuxuryItem) => {
                        const brand = brands.find((b: Brand) => b.id === item.brandId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={(item.images && item.images[0]) || "https://images.unsplash.com/photo-1611652022419-a9419f74343d"}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {brand ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{brand.name}</span>
                                  {brand.verified && (
                                    <Shield className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">Unknown</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{item.price}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "listed" ? "default" :
                                  item.status === "sold" ? "secondary" : "outline"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.certified ? "default" : "outline"}>
                                {item.certified ? "Verified" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/item/${item.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/sell?edit=${item.id}`)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Brands ({userBrands.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userBrands.map((brand: Brand) => (
                    <Card key={brand.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{brand.name}</CardTitle>
                          {brand.verified && (
                            <Shield className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {brand.description}
                        </p>
                        <div className="text-sm text-gray-500">
                          Items: {items.filter((item: LuxuryItem) => item.brandId === brand.id).length}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userBrands.map((brand: Brand) => {
                      const brandItems = items.filter((item: LuxuryItem) => item.brandId === brand.id);
                      const soldBrandItems = brandItems.filter((item: LuxuryItem) => item.status === "sold").length;
                      const brandConversion = brandItems.length > 0 ? (soldBrandItems / brandItems.length) * 100 : 0;
                      
                      return (
                        <div key={brand.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">{brand.name}</div>
                            <div className="text-sm text-gray-500">
                              {brandItems.length} items • {soldBrandItems} sold
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{brandConversion.toFixed(1)}%</div>
                            <div className="text-sm text-gray-500">conversion</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                      <span className="font-medium">
                        ${userItems
                          .filter(item => item.status === "sold")
                          .reduce((sum, item) => {
                            const price = parseFloat(item.price.replace(/[$,]/g, ""));
                            return sum + (isNaN(price) ? 0 : price);
                          }, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Average Item Value</span>
                      <span className="font-medium">
                        ${userItems.length > 0 ? Math.round(totalValue / userItems.length).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Most Expensive Item</span>
                      <span className="font-medium">
                        ${Math.max(...userItems.map(item => {
                          const price = parseFloat(item.price.replace(/[$,]/g, ""));
                          return isNaN(price) ? 0 : price;
                        }), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}