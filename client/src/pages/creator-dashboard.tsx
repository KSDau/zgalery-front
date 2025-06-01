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
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brand, LuxuryItem } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const brandFormSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  description: z.string().min(1, "Description is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type BrandFormData = z.infer<typeof brandFormSchema>;

/**
 * CreatorDashboard component that allows brands to manage their luxury items,
 * view brand analytics, and create new brands.
 */
export default function CreatorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [selectedOwnerId] = useState(3); // Demo user ID
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      contactEmail: "",
    },
  });

  // Fetch brands data
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  // Fetch items data  
  const { data: items = [], isLoading: itemsLoading } = useQuery<LuxuryItem[]>({
    queryKey: ['/api/items'],
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (brandData: BrandFormData) => {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...brandData,
          ownerId: 3 // Using test user ID for demo
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Brand Created Successfully",
        description: "Your brand has been created and is ready for item listings.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      form.reset();
      setIsCreateBrandOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create brand",
        variant: "destructive",
      });
    },
  });

  const handleCreateBrand = (data: BrandFormData) => {
    createBrandMutation.mutate(data);
  };

  // Get user's brands
  const userBrands = brands.filter((brand: Brand) => brand.ownerId === selectedOwnerId);
  
  // Filter items by brand ownership, search and status
  const filteredItems = items.filter((item: LuxuryItem) => {
    const itemBrand = brands.find((brand: Brand) => brand.id === item.brandId);
    const ownsBrand = brandFilter === "all" || (itemBrand && itemBrand.ownerId === selectedOwnerId);
    const matchesBrandFilter = brandFilter === "all" || item.brandId === parseInt(brandFilter);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return ownsBrand && matchesBrandFilter && matchesSearch && matchesStatus;
  });

  // Calculate analytics for user's items
  const userItems = items.filter((item: LuxuryItem) => {
    const itemBrand = brands.find((brand: Brand) => brand.id === item.brandId);
    return itemBrand && itemBrand.ownerId === selectedOwnerId;
  });
  
  const totalItems = userItems.length;
  const activeItems = userItems.filter((item: LuxuryItem) => item.status === "listed").length;
  const soldItems = userItems.filter((item: LuxuryItem) => item.status === "sold").length;
  const totalBrands = userBrands.length;
  const totalValue = userItems.reduce((sum, item: LuxuryItem) => {
    const price = parseFloat(item.price.replace(/[$,]/g, '')) || 0;
    return sum + price;
  }, 0);
  
  const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
  const conversionRate = totalItems > 0 ? (soldItems / totalItems) * 100 : 0;

  if (brandsLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/marketplace")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Creator Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your brands and luxury items</p>
            </div>
          </div>
          
          <Dialog open={isCreateBrandOpen} onOpenChange={setIsCreateBrandOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Brand
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Brand</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateBrand)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your brand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourbrand.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@yourbrand.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateBrandOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBrandMutation.isPending}
                      className="flex-1 bg-black hover:bg-gray-800 text-white"
                    >
                      {createBrandMutation.isPending ? "Creating..." : "Create Brand"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {activeItems} currently listed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBrands}</div>
              <p className="text-xs text-muted-foreground">
                Active brand partnerships
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total catalog value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeItems}</div>
              <p className="text-xs text-muted-foreground">
                Available for purchase
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Luxury Items</TabsTrigger>
            <TabsTrigger value="brands">Brand Management</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Luxury Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500 dark:text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium mb-1">No items found</p>
                            <p className="text-sm">
                              {searchTerm || statusFilter !== "all" 
                                ? "Try adjusting your search or filters" 
                                : "Start by creating your first luxury item"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item: LuxuryItem) => {
                        const brand = brands.find((b: Brand) => b.id === item.brandId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.images && item.images.length > 0 && (
                                  <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-40">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{brand?.name || "Unknown"}</TableCell>
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
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
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

          <TabsContent value="brands" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Portfolio</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your luxury brand partnerships and collaborations
                </p>
              </CardHeader>
              <CardContent>
                {brands.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No brands yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create your first brand to start listing luxury items
                    </p>
                    <Button 
                      onClick={() => setIsCreateBrandOpen(true)}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Brand
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map((brand: Brand) => {
                      const brandItems = items.filter((item: LuxuryItem) => item.brandId === brand.id);
                      const brandValue = brandItems.reduce((sum, item) => {
                        const price = parseFloat(item.price.replace(/[$,]/g, '')) || 0;
                        return sum + price;
                      }, 0);
                      
                      return (
                        <Card key={brand.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{brand.name}</CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {brand.description}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Items</span>
                                <span className="font-medium">{brandItems.length}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                                <span className="font-medium">${brandValue.toLocaleString()}</span>
                              </div>
                              {brand.website && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Website</span>
                                  <a 
                                    href={brand.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    Visit
                                  </a>
                                </div>
                              )}
                              <div className="pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => setLocation("/sell")}
                                >
                                  Add Item
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}