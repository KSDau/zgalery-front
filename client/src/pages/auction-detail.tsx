import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Gavel, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { luxuryItems } from "@/data/luxury-items";
import { useWeb3 } from "@/hooks/use-web3";

interface Bid {
  id: string;
  bidder: string;
  amount: string;
  timestamp: string;
  txHash?: string;
}

interface AuctionData {
  id: number;
  startTime: string;
  endTime: string;
  startingPrice: string;
  currentBid: string;
  minimumIncrement: string;
  totalBids: number;
  status: "active" | "ended" | "upcoming";
  bids: Bid[];
}

/**
 * AuctionDetail component that displays detailed auction information
 * with bidding functionality and real-time updates.
 */
export default function AuctionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { address } = useWeb3();
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const item = luxuryItems.find(item => item.id === parseInt(id || "0"));

  // Mock auction data
  const auctionData: AuctionData = {
    id: parseInt(id || "0"),
    startTime: "2024-01-20T10:00:00Z",
    endTime: "2024-01-27T18:00:00Z",
    startingPrice: "$25,000",
    currentBid: "$42,500",
    minimumIncrement: "$1,000",
    totalBids: 12,
    status: "active",
    bids: [
      {
        id: "1",
        bidder: "0x742d35Cc6664C8532d2aFa19B8e9FACcE25F0e8a",
        amount: "$42,500",
        timestamp: "2024-01-25T14:30:00Z",
        txHash: "0xabc123..."
      },
      {
        id: "2",
        bidder: "0x8ba1f109551bD432803012645Hac136c9.002",
        amount: "$41,000",
        timestamp: "2024-01-25T12:15:00Z",
        txHash: "0xdef456..."
      },
      {
        id: "3",
        bidder: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
        amount: "$38,500",
        timestamp: "2024-01-25T09:45:00Z",
        txHash: "0xghi789..."
      }
    ]
  };

  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(auctionData.endTime).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Auction ended");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auctionData.endTime]);

  if (!item) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
            Auction not found
          </h2>
          <Button onClick={() => setLocation("/marketplace")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </main>
    );
  }

  const handlePlaceBid = () => {
    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place a bid.",
        variant: "destructive",
      });
      return;
    }

    if (!bidAmount) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount.",
        variant: "destructive",
      });
      return;
    }

    const currentBidValue = parseInt(auctionData.currentBid.replace(/[$,]/g, ""));
    const bidValue = parseInt(bidAmount.replace(/[$,]/g, ""));
    const minimumBid = currentBidValue + parseInt(auctionData.minimumIncrement.replace(/[$,]/g, ""));

    if (bidValue < minimumBid) {
      toast({
        title: "Bid Too Low",
        description: `Your bid must be at least $${minimumBid.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bid Placed Successfully",
      description: `Your bid of $${bidValue.toLocaleString()} has been placed. This is a prototype - in a real auction, this would interact with smart contracts.`,
    });

    setBidAmount("");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Item Details */}
        <div className="lg:col-span-2 space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/marketplace")}
            className="mb-4 p-0 h-auto font-normal"
            style={{ color: 'hsl(var(--zg-muted))' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          {/* Item Image */}
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}>
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Item Information */}
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
                    {item.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Gavel className="w-3 h-3 mr-1" />
                    Live Auction
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed mb-6" style={{ color: 'hsl(var(--zg-muted))' }}>
                {item.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium" style={{ color: 'hsl(var(--zg-primary))' }}>Starting Price</p>
                  <p style={{ color: 'hsl(var(--zg-muted))' }}>{auctionData.startingPrice}</p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'hsl(var(--zg-primary))' }}>Minimum Increment</p>
                  <p style={{ color: 'hsl(var(--zg-muted))' }}>{auctionData.minimumIncrement}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Auction Details */}
        <div className="space-y-6">
          {/* Auction Status */}
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: 'hsl(var(--zg-primary))' }}>
                <Clock className="w-5 h-5 mr-2" />
                Auction Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--zg-muted))' }}>Current Bid</p>
                  <p className="text-3xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                    {auctionData.currentBid}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--zg-muted))' }}>Time Remaining</p>
                  <p className="text-xl font-semibold text-red-600">
                    {timeLeft}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm" style={{ color: 'hsl(var(--zg-muted))' }}>Total Bids</p>
                    <p className="text-lg font-semibold" style={{ color: 'hsl(var(--zg-primary))' }}>
                      {auctionData.totalBids}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'hsl(var(--zg-muted))' }}>Bidders</p>
                    <p className="text-lg font-semibold" style={{ color: 'hsl(var(--zg-primary))' }}>
                      {auctionData.bids.length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Bid */}
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <CardTitle style={{ color: 'hsl(var(--zg-primary))' }}>
                Place Bid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
                  Bid Amount (USD)
                </label>
                <Input
                  type="text"
                  placeholder="$43,500"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  style={{ 
                    backgroundColor: 'hsl(var(--zg-secondary))', 
                    borderColor: 'hsl(var(--zg-border))' 
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--zg-muted))' }}>
                  Minimum bid: ${(parseInt(auctionData.currentBid.replace(/[$,]/g, "")) + parseInt(auctionData.minimumIncrement.replace(/[$,]/g, ""))).toLocaleString()}
                </p>
              </div>
              
              <Button 
                onClick={handlePlaceBid}
                className="w-full"
                disabled={auctionData.status !== "active"}
                style={{ 
                  backgroundColor: 'hsl(var(--zg-primary))',
                  color: 'hsl(var(--zg-bg))'
                }}
              >
                <Gavel className="w-4 h-4 mr-2" />
                Place Bid
              </Button>
              
              {!address && (
                <p className="text-xs text-center" style={{ color: 'hsl(var(--zg-muted))' }}>
                  Connect your wallet to place bids
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: 'hsl(var(--zg-primary))' }}>
                <TrendingUp className="w-5 h-5 mr-2" />
                Bid History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auctionData.bids.map((bid, index) => (
                  <div 
                    key={bid.id} 
                    className="flex justify-between items-center p-3 rounded-lg"
                    style={{ backgroundColor: index === 0 ? 'hsl(var(--zg-secondary))' : 'transparent' }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: 'hsl(var(--zg-primary))' }}>
                        {bid.amount}
                      </p>
                      <p className="text-xs" style={{ color: 'hsl(var(--zg-muted))' }}>
                        {formatAddress(bid.bidder)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'hsl(var(--zg-muted))' }}>
                        {formatTime(bid.timestamp)}
                      </p>
                      {index === 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Leading
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}