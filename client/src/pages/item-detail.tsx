import { useParams, useLocation } from "wouter";
import { luxuryItems } from "@/data/luxury-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, IdCard, Heart, Share2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

/**
 * ItemDetail component that displays detailed information about a specific luxury item
 * including certificate verification and purchase options.
 */
export default function ItemDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const item = luxuryItems.find(item => item.id === parseInt(id || "0"));

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
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {/* Thumbnail placeholders */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div 
                key={index}
                className="aspect-square rounded-lg opacity-50"
                style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}
              />
            ))}
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
            
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
              {item.name}
            </h1>
            <p className="text-2xl font-semibold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
              {item.price}
            </p>
            
            {/* IdCard Badge */}
            {item.certified && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 mb-6">
                <IdCard className="w-4 h-4 mr-2" />
                Blockchain Certified
              </Badge>
            )}
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

          {/* IdCard Details */}
          <Card style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
                IdCard Verification
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Token ID:</span>
                  <span className="font-mono text-sm" style={{ color: 'hsl(var(--zg-primary))' }}>
                    #{item.tokenId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Contract:</span>
                  <span className="font-mono text-sm" style={{ color: 'hsl(var(--zg-primary))' }}>
                    {item.contractAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Blockchain:</span>
                  <span style={{ color: 'hsl(var(--zg-primary))' }}>Ethereum</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--zg-muted))' }}>Authenticity:</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <IdCard className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                </div>
              </div>
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
                View on Blockchain Explorer
              </Button>
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
