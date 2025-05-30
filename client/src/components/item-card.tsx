import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdCard, Clock, Gavel } from "lucide-react";
import { useLocation } from "wouter";
import type { LuxuryItem } from "@/data/luxury-items";

interface ItemCardProps {
  item: LuxuryItem;
}

/**
 * ItemCard component that displays a luxury item in the marketplace grid
 * with image, details, and certificate verification badge.
 */
export default function ItemCard({ item }: ItemCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    if (item.saleType === "auction") {
      setLocation(`/auction/${item.id}`);
    } else {
      setLocation(`/item/${item.id}`);
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      onClick={handleClick}
      style={{ 
        backgroundColor: 'white',
        borderColor: 'hsl(var(--zg-border))'
      }}
    >
      <div className="aspect-square overflow-hidden relative" style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}>
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 space-y-2">
          {item.certified && (
            <Badge 
              className="bg-green-500 text-white border-green-500 block"
            >
              <IdCard className="w-3 h-3 mr-1" />
              Certified
            </Badge>
          )}
          {item.saleType === "auction" && (
            <Badge 
              className="bg-blue-500 text-white border-blue-500 block"
            >
              <Gavel className="w-3 h-3 mr-1" />
              Auction
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
          {item.name}
        </h3>
        <p className="mb-4 line-clamp-2" style={{ color: 'hsl(var(--zg-muted))' }}>
          {item.description.substring(0, 100)}...
        </p>
        <div className="flex justify-between items-center">
          <div>
            {item.saleType === "auction" ? (
              <div>
                <p className="text-sm" style={{ color: 'hsl(var(--zg-muted))' }}>Current Bid</p>
                <span className="text-2xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                  {item.currentBid}
                </span>
                <p className="text-xs" style={{ color: 'hsl(var(--zg-muted))' }}>
                  {item.totalBids} bid{item.totalBids !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <span className="text-2xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                {item.price}
              </span>
            )}
          </div>
          <Badge 
            variant="secondary"
            style={{ 
              backgroundColor: 'hsl(var(--zg-secondary))',
              color: 'hsl(var(--zg-muted))'
            }}
          >
            {item.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
