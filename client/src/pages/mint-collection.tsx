import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Coins, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brand } from "@shared/schema";

/**
 * MintCollection component that allows creators to mint items from their collections
 * with collection name, number of items, and unit price configuration.
 */
export default function MintCollection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [collectionName, setCollectionName] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfItems, setNumberOfItems] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [category, setCategory] = useState("");

  // Fetch brands for selection
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Filter user's brands (mock user ID = 3)
  const userBrands = brands.filter((brand: Brand) => brand.ownerId === 3);

  // Mint collection mutation
  const mintCollectionMutation = useMutation({
    mutationFn: async (collectionData: {
      collectionName: string;
      description: string;
      numberOfItems: number;
      unitPrice: string;
      brandId: number;
      category: string;
    }) => {
      // Create multiple items for the collection
      const promises = [];
      for (let i = 1; i <= collectionData.numberOfItems; i++) {
        const itemData = {
          name: `${collectionData.collectionName} #${i}`,
          description: collectionData.description,
          price: collectionData.unitPrice,
          category: collectionData.category,
          brandId: collectionData.brandId,
          images: [`https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop&crop=center&auto=format`],
          conservationStatus: "Excellent",
          identificationNumber: `${collectionData.collectionName.replace(/\s+/g, "").toUpperCase()}-${String(i).padStart(3, "0")}`,
          certified: false,
          saleType: "fixed",
          status: "listed"
        };
        promises.push(apiRequest("/api/items", { method: "POST", body: itemData }));
      }
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Collection Minted Successfully",
        description: `${numberOfItems} items have been added to your collection.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setLocation("/creator");
    },
    onError: (error: Error) => {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint collection items.",
        variant: "destructive",
      });
    },
  });

  const handleMintCollection = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionName || !selectedBrandId || !unitPrice || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    mintCollectionMutation.mutate({
      collectionName,
      description,
      numberOfItems,
      unitPrice,
      brandId: parseInt(selectedBrandId),
      category,
    });
  };

  if (brandsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading brands...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/creator")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mint Item Collection</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create multiple items from your luxury collection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMintCollection} className="space-y-6">
                  {/* Collection Name */}
                  <div className="space-y-2">
                    <Label htmlFor="collectionName">Collection Name *</Label>
                    <Input
                      id="collectionName"
                      placeholder="e.g., Royal Oak Limited Edition"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your collection..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Brand Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Select value={selectedBrandId} onValueChange={setSelectedBrandId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {userBrands.map((brand: Brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Watches">Watches</SelectItem>
                        <SelectItem value="Jewelry">Jewelry</SelectItem>
                        <SelectItem value="Handbags">Handbags</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Collectibles">Collectibles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Items */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfItems">Number of Items</Label>
                    <Input
                      id="numberOfItems"
                      type="number"
                      min="1"
                      max="100"
                      value={numberOfItems}
                      onChange={(e) => setNumberOfItems(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-sm text-gray-500">Maximum 100 items per collection</p>
                  </div>

                  {/* Unit Price */}
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      placeholder="e.g., $25,000"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">Price per individual item in the collection</p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={mintCollectionMutation.isPending}
                  >
                    {mintCollectionMutation.isPending ? "Minting Collection..." : "Mint Collection"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Collection Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Items to Mint</div>
                    <div className="text-sm text-gray-500">{numberOfItems} items</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Unit Price</div>
                    <div className="text-sm text-gray-500">{unitPrice || "$0"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Total Value</div>
                    <div className="text-sm text-gray-500">
                      {unitPrice ? 
                        `$${(numberOfItems * parseFloat(unitPrice.replace(/[$,]/g, "") || "0")).toLocaleString()}` : 
                        "$0"
                      }
                    </div>
                  </div>
                </div>

                {selectedBrandId && (
                  <div className="pt-4 border-t">
                    <div className="font-medium">Selected Brand</div>
                    <div className="text-sm text-gray-500">
                      {userBrands.find(b => b.id.toString() === selectedBrandId)?.name || ""}
                    </div>
                  </div>
                )}

                {collectionName && (
                  <div>
                    <div className="font-medium">Collection</div>
                    <div className="text-sm text-gray-500">{collectionName}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Minting Process</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Each item will be automatically numbered</p>
                <p>• Unique identification codes will be generated</p>
                <p>• Items will be listed immediately</p>
                <p>• Certificate verification is pending by default</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}