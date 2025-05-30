import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdCard } from "lucide-react";
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
    setLocation(`/item/${item.id}`);
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
        {item.certified && (
          <Badge 
            className="absolute top-4 right-4 bg-green-500 text-white border-green-500"
          >
            <IdCard className="w-3 h-3 mr-1" />
            Certified
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
          {item.name}
        </h3>
        <p className="mb-4 line-clamp-2" style={{ color: 'hsl(var(--zg-muted))' }}>
          {item.description.substring(0, 100)}...
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
            {item.price}
          </span>
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
