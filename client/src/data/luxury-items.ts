/**
 * Mock data for luxury items in the zgallery marketplace.
 * Each item includes authentication and certificate information.
 */

export interface LuxuryItem {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
  category: string;
  brand: string;
  certified: boolean;
  tokenId: string;
  contractAddress: string;
  saleType: "fixed" | "auction";
  auctionEndTime?: string;
  currentBid?: string;
  totalBids?: number;
}

export const luxuryItems: LuxuryItem[] = [
  {
    id: 1,
    name: "Vintage Rolex Submariner",
    price: "$35,000",
    image: "https://images.unsplash.com/photo-1523170335258-f5c6c6bd6edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    description: "A pristine 1970s Rolex Submariner with original box and papers. This iconic timepiece represents the pinnacle of Swiss watchmaking craftsmanship. Features include automatic movement, 40mm case diameter, and water resistance to 300 meters. Complete with blockchain certificate of authenticity.",
    category: "Watches",
    brand: "Rolex",
    certified: true,
    tokenId: "47291",
    contractAddress: "0x8b4c...a7f2",
    saleType: "auction",
    auctionEndTime: "2024-01-27T18:00:00Z",
    currentBid: "$42,500",
    totalBids: 12
  },
  {
    id: 2,
    name: "Diamond Tennis Bracelet",
    price: "$28,500",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    description: "Exquisite 18k white gold tennis bracelet featuring 50 round brilliant cut diamonds totaling 10 carats. Each diamond is individually certified and graded. The bracelet showcases exceptional fire and brilliance, perfect for special occasions or as an investment piece.",
    category: "Jewelry",
    brand: "Tiffany & Co.",
    certified: true,
    tokenId: "47292",
    contractAddress: "0x8b4c...a7f3",
    saleType: "fixed"
  },
  {
    id: 3,
    name: "Original Basquiat Artwork",
    price: "$125,000",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    description: "An authentic Jean-Michel Basquiat original painting from his Neo-expressionist period. This piece showcases his distinctive style with bold colors and powerful imagery. Comes with full provenance documentation and blockchain verification of authenticity and ownership history.",
    category: "Art",
    brand: "Jean-Michel Basquiat",
    certified: true,
    tokenId: "47293",
    contractAddress: "0x8b4c...a7f4",
    saleType: "auction",
    auctionEndTime: "2024-01-28T20:00:00Z",
    currentBid: "$148,000",
    totalBids: 8
  },
  {
    id: 4,
    name: "Hermès Birkin Bag",
    price: "$45,000",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    description: "Rare Hermès Birkin 35cm in Togo leather with palladium hardware. This coveted handbag represents the ultimate in luxury fashion accessories. Crafted by skilled artisans using traditional techniques, each bag takes over 18 hours to complete.",
    category: "Fashion",
    brand: "Hermès",
    certified: true,
    tokenId: "47294",
    contractAddress: "0x8b4c...a7f5",
    saleType: "fixed"
  },
  {
    id: 5,
    name: "Vintage Cartier Panthere",
    price: "$52,000",
    image: "https://images.unsplash.com/photo-1594736797933-d0d3115db3b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    description: "Elegant Cartier Panthere de Cartier watch in 18k yellow gold. Features quartz movement, champagne dial, and integrated bracelet. This timeless piece embodies Cartier's Art Deco heritage and sophisticated design philosophy.",
    category: "Watches",
    brand: "Cartier",
    certified: true,
    tokenId: "47295",
    contractAddress: "0x8b4c...a7f6",
    saleType: "auction",
    auctionEndTime: "2024-01-26T15:30:00Z",
    currentBid: "$67,200",
    totalBids: 15
  },
  {
    id: 6,
    name: "Tiffany Emerald Necklace",
    price: "$75,000",
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    description: "Stunning Tiffany & Co. necklace featuring a 15-carat Colombian emerald surrounded by brilliant-cut diamonds. Set in platinum with a delicate chain, this piece represents the finest in American jewelry craftsmanship and design.",
    category: "Jewelry",
    brand: "Tiffany & Co.",
    certified: true,
    tokenId: "47296",
    contractAddress: "0x8b4c...a7f7",
    saleType: "fixed"
  }
];
