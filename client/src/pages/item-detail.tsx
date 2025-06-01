import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, IdCard, Heart, Share2, ExternalLink, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { LuxuryItem, Brand } from "@shared/schema";

/**
 * ItemDetail component that displays detailed information about a specific luxury item
 * including certificate verification and purchase options.
 */
export default function ItemDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: item, isLoading: itemLoading } = useQuery<LuxuryItem>({
    queryKey: ['/api/items', id],
    queryFn: async () => {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error('Item not found');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const brand = brands.find((b: Brand) => b.id === item?.brandId);

  if (itemLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
            Item not found
          </h2>
          <Button onClick={() => setLocation("/marketplace")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </main>
    );
  }

  const handleAddToWishlist = () => {
    toast({
      title: "Added to Wishlist",
      description: `${item.name} has been added to your wishlist.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out this luxury item: ${item.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Item link has been copied to your clipboard.",
      });
    }
  };

  const handlePurchase = () => {
    toast({
      title: "Purchase Initiated",
      description: "This is a prototype. In a real application, this would initiate the Web3 purchase process.",
    });
  };

  const handleViewOnBlockchain = () => {
    toast({
      title: "Blockchain Explorer",
      description: "This is a prototype. In a real application, this would open the blockchain explorer.",
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Item Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}>
            {item.images && item.images.length > 0 ? (
              <img 
                src={item.images[0]} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Package className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {item.images && item.images.length > 1 ? (
              item.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${item.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg opacity-50"
                  style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}
                />
              ))
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="space-y-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/marketplace")}
              className="mb-4 p-0 h-auto font-normal"
              style={{ color: 'hsl(var(--zg-muted))' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
            
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                {item.name}
              </h1>
              {item.certified && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  <IdCard className="w-3 h-3 mr-1" />
                  Certified
                </Badge>
              )}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              {brand?.name || "Unknown Brand"} • {item.category}
            </p>
            <p className="text-2xl font-semibold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
              {item.price}
            </p>
            <div className="flex items-center gap-4 mb-6">
              <Badge variant={item.status === "listed" ? "default" : item.status === "sold" ? "secondary" : "outline"}>
                {item.status}
              </Badge>
              {item.conservationStatus && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Condition: {item.conservationStatus}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'hsl(var(--zg-primary))' }}>
              Description
            </h3>
            <p className="leading-relaxed" style={{ color: 'hsl(var(--zg-muted))' }}>
              {item.description}
            </p>
          </div>

          {/* Item Details */}
          <Card style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
                Item Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Brand:</span>
                  <span style={{ color: 'hsl(var(--zg-primary))' }}>
                    {brand?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Category:</span>
                  <span style={{ color: 'hsl(var(--zg-primary))' }}>
                    {item.category}
                  </span>
                </div>
                {item.identificationNumber && (
                  <div className="flex justify-between">
                    <span style={{ color: 'hsl(var(--zg-muted))' }}>ID Number:</span>
                    <span className="font-mono text-sm" style={{ color: 'hsl(var(--zg-primary))' }}>
                      {item.identificationNumber}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Sale Type:</span>
                  <span style={{ color: 'hsl(var(--zg-primary))' }}>
                    {item.saleType === "fixed" ? "Fixed Price" : "Auction"}
                  </span>
                </div>
                {item.tokenId && (
                  <div className="flex justify-between">
                    <span style={{ color: 'hsl(var(--zg-muted))' }}>Token ID:</span>
                    <span className="font-mono text-sm" style={{ color: 'hsl(var(--zg-primary))' }}>
                      #{item.tokenId}
                    </span>
                  </div>
                )}
                {item.contractAddress && (
                  <div className="flex justify-between">
                    <span style={{ color: 'hsl(var(--zg-muted))' }}>Contract:</span>
                    <span className="font-mono text-sm" style={{ color: 'hsl(var(--zg-primary))' }}>
                      {item.contractAddress.slice(0, 20)}...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Blockchain:</span>
                  <span style={{ color: 'hsl(var(--zg-primary))' }}>Aleo</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Authenticity:</span>
                  <span className={`font-medium flex items-center ${item.certified ? "text-green-600" : "text-orange-600"}`}>
                    <IdCard className="w-4 h-4 mr-1" />
                    {item.certified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
              {item.contractAddress && (
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={handleViewOnBlockchain}
                  style={{ 
                    backgroundColor: 'hsl(var(--zg-primary))',
                    color: 'hsl(var(--zg-bg))',
                    borderColor: 'hsl(var(--zg-primary))'
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Aleo Explorer
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <Button 
              className="w-full py-4 text-lg font-semibold"
              onClick={handlePurchase}
              style={{ 
                backgroundColor: 'hsl(var(--zg-primary))',
                color: 'hsl(var(--zg-bg))'
              }}
            >
              Purchase Item
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleAddToWishlist}
                style={{ 
                  backgroundColor: 'hsl(var(--zg-secondary))',
                  color: 'hsl(var(--zg-primary))',
                  borderColor: 'hsl(var(--zg-border))'
                }}
              >
                <Heart className="w-4 h-4 mr-2" />
                Add to Wishlist
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                style={{ 
                  backgroundColor: 'hsl(var(--zg-secondary))',
                  color: 'hsl(var(--zg-primary))',
                  borderColor: 'hsl(var(--zg-border))'
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
