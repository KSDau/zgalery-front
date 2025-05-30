import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Package,
  Gavel,
  History,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";
import { luxuryItems } from "@/data/luxury-items";

interface UserData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  walletAddress: string;
}

interface OwnedItem {
  id: number;
  name: string;
  image: string;
  category: string;
  purchasePrice: string;
  purchaseDate: string;
  currentValue: string;
  status: "owned" | "listed" | "sold";
}

interface BidData {
  id: string;
  itemId: number;
  itemName: string;
  itemImage: string;
  bidAmount: string;
  bidDate: string;
  status: "active" | "outbid" | "won";
  auctionEndTime: string;
}

interface PurchaseHistory {
  id: string;
  itemName: string;
  itemImage: string;
  purchasePrice: string;
  purchaseDate: string;
  seller: string;
  transactionHash: string;
}

/**
 * UserProfile component that displays user information, inventory,
 * current bids, and purchase history.
 */
export default function UserProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { address } = useWeb3();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "Alex Thompson",
    email: "alex.thompson@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    bio: "Luxury watch collector and art enthusiast with over 15 years of experience in authenticated collectibles.",
    walletAddress: address || "0x742d35Cc6664C8532d2aFa19B8e9FACcE25F0e8a"
  });

  // Mock owned items
  const ownedItems: OwnedItem[] = [
    {
      id: 1,
      name: "Vintage Rolex Submariner",
      image: luxuryItems[0].image,
      category: "Watches",
      purchasePrice: "$32,000",
      purchaseDate: "2023-12-15",
      currentValue: "$35,000",
      status: "owned"
    },
    {
      id: 2,
      name: "Diamond Tennis Bracelet",
      image: luxuryItems[1].image,
      category: "Jewelry",
      purchasePrice: "$26,500",
      purchaseDate: "2023-11-20",
      currentValue: "$28,500",
      status: "listed"
    }
  ];

  // Mock current bids
  const currentBids: BidData[] = [
    {
      id: "bid_1",
      itemId: 3,
      itemName: "Original Basquiat Artwork",
      itemImage: luxuryItems[2].image,
      bidAmount: "$148,000",
      bidDate: "2024-01-25",
      status: "active",
      auctionEndTime: "2024-01-28T20:00:00Z"
    },
    {
      id: "bid_2",
      itemId: 5,
      itemName: "Vintage Cartier Panthere",
      itemImage: luxuryItems[4].image,
      bidAmount: "$65,000",
      bidDate: "2024-01-24",
      status: "outbid",
      auctionEndTime: "2024-01-26T15:30:00Z"
    }
  ];

  // Mock purchase history
  const purchaseHistory: PurchaseHistory[] = [
    {
      id: "purchase_1",
      itemName: "Vintage Rolex Submariner",
      itemImage: luxuryItems[0].image,
      purchasePrice: "$32,000",
      purchaseDate: "2023-12-15",
      seller: "0x8ba1f109551bD432803012645Hac136c9.002",
      transactionHash: "0xabc123def456..."
    },
    {
      id: "purchase_2",
      itemName: "Diamond Tennis Bracelet",
      itemImage: luxuryItems[1].image,
      purchasePrice: "$26,500",
      purchaseDate: "2023-11-20",
      seller: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      transactionHash: "0xdef456ghi789..."
    }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleViewItem = (itemId: number) => {
    setLocation(`/item/${itemId}`);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "outbid":
        return <Badge className="bg-red-100 text-red-800">Outbid</Badge>;
      case "won":
        return <Badge className="bg-blue-100 text-blue-800">Won</Badge>;
      case "owned":
        return <Badge className="bg-green-100 text-green-800">Owned</Badge>;
      case "listed":
        return <Badge className="bg-blue-100 text-blue-800">Listed</Badge>;
      case "sold":
        return <Badge className="bg-gray-100 text-gray-800">Sold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!address) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'hsl(var(--zg-primary))' }}>
            Connect Your Wallet
          </h2>
          <p className="mb-6" style={{ color: 'hsl(var(--zg-muted))' }}>
            Please connect your wallet to view your profile and inventory.
          </p>
          <Button onClick={() => setLocation("/marketplace")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/marketplace")}
          className="mb-4 p-0 h-auto font-normal"
          style={{ color: 'hsl(var(--zg-muted))' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
              User Profile
            </h1>
            <p style={{ color: 'hsl(var(--zg-muted))' }}>
              Manage your account, inventory, and bidding activity
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center" style={{ color: 'hsl(var(--zg-primary))' }}>
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  style={{ 
                    backgroundColor: 'hsl(var(--zg-secondary))',
                    color: 'hsl(var(--zg-primary))',
                    borderColor: 'hsl(var(--zg-border))'
                  }}
                >
                  {isEditing ? <Save className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--zg-primary))' }}>
                  Name
                </label>
                {isEditing ? (
                  <Input
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    style={{ 
                      backgroundColor: 'hsl(var(--zg-secondary))', 
                      borderColor: 'hsl(var(--zg-border))' 
                    }}
                  />
                ) : (
                  <p style={{ color: 'hsl(var(--zg-muted))' }}>{userData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--zg-primary))' }}>
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    style={{ 
                      backgroundColor: 'hsl(var(--zg-secondary))', 
                      borderColor: 'hsl(var(--zg-border))' 
                    }}
                  />
                ) : (
                  <p className="flex items-center" style={{ color: 'hsl(var(--zg-muted))' }}>
                    <Mail className="w-4 h-4 mr-2" />
                    {userData.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--zg-primary))' }}>
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    style={{ 
                      backgroundColor: 'hsl(var(--zg-secondary))', 
                      borderColor: 'hsl(var(--zg-border))' 
                    }}
                  />
                ) : (
                  <p className="flex items-center" style={{ color: 'hsl(var(--zg-muted))' }}>
                    <Phone className="w-4 h-4 mr-2" />
                    {userData.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--zg-primary))' }}>
                  Location
                </label>
                {isEditing ? (
                  <Input
                    value={userData.location}
                    onChange={(e) => setUserData({...userData, location: e.target.value})}
                    style={{ 
                      backgroundColor: 'hsl(var(--zg-secondary))', 
                      borderColor: 'hsl(var(--zg-border))' 
                    }}
                  />
                ) : (
                  <p className="flex items-center" style={{ color: 'hsl(var(--zg-muted))' }}>
                    <MapPin className="w-4 h-4 mr-2" />
                    {userData.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--zg-primary))' }}>
                  Bio
                </label>
                {isEditing ? (
                  <Textarea
                    value={userData.bio}
                    onChange={(e) => setUserData({...userData, bio: e.target.value})}
                    className="min-h-[80px]"
                    style={{ 
                      backgroundColor: 'hsl(var(--zg-secondary))', 
                      borderColor: 'hsl(var(--zg-border))' 
                    }}
                  />
                ) : (
                  <p style={{ color: 'hsl(var(--zg-muted))' }}>{userData.bio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--zg-primary))' }}>
                  Wallet Address
                </label>
                <p className="font-mono text-sm break-all" style={{ color: 'hsl(var(--zg-muted))' }}>
                  {userData.walletAddress}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="bids">Current Bids</TabsTrigger>
              <TabsTrigger value="history">Purchase History</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: 'hsl(var(--zg-primary))' }}>
                    <Package className="w-5 h-5 mr-2" />
                    My Inventory ({ownedItems.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ownedItems.map(item => (
                      <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewItem(item.id)}>
                        <div className="aspect-square overflow-hidden rounded-t-lg" style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}>
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold" style={{ color: 'hsl(var(--zg-primary))' }}>
                              {item.name}
                            </h3>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span style={{ color: 'hsl(var(--zg-muted))' }}>Purchase Price:</span>
                              <span style={{ color: 'hsl(var(--zg-primary))' }}>{item.purchasePrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: 'hsl(var(--zg-muted))' }}>Current Value:</span>
                              <span style={{ color: 'hsl(var(--zg-primary))' }}>{item.currentValue}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: 'hsl(var(--zg-muted))' }}>Purchased:</span>
                              <span style={{ color: 'hsl(var(--zg-primary))' }}>{item.purchaseDate}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bids" className="space-y-6">
              <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: 'hsl(var(--zg-primary))' }}>
                    <Gavel className="w-5 h-5 mr-2" />
                    Current Bids ({currentBids.length} active)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Bid Amount</TableHead>
                        <TableHead>Bid Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Auction Ends</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBids.map(bid => (
                        <TableRow key={bid.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img 
                                src={bid.itemImage} 
                                alt={bid.itemName}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <span className="font-medium">{bid.itemName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{bid.bidAmount}</TableCell>
                          <TableCell>{bid.bidDate}</TableCell>
                          <TableCell>{getStatusBadge(bid.status)}</TableCell>
                          <TableCell>{new Date(bid.auctionEndTime).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setLocation(`/auction/${bid.itemId}`)}
                              style={{ 
                                backgroundColor: 'hsl(var(--zg-secondary))',
                                color: 'hsl(var(--zg-primary))',
                                borderColor: 'hsl(var(--zg-border))'
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: 'hsl(var(--zg-primary))' }}>
                    <History className="w-5 h-5 mr-2" />
                    Purchase History ({purchaseHistory.length} transactions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Transaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseHistory.map(purchase => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img 
                                src={purchase.itemImage} 
                                alt={purchase.itemName}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <span className="font-medium">{purchase.itemName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{purchase.purchasePrice}</TableCell>
                          <TableCell>{purchase.purchaseDate}</TableCell>
                          <TableCell className="font-mono">{formatAddress(purchase.seller)}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toast({
                                title: "Transaction Details",
                                description: `Transaction hash: ${purchase.transactionHash}`
                              })}
                              style={{ 
                                backgroundColor: 'hsl(var(--zg-secondary))',
                                color: 'hsl(var(--zg-primary))',
                                borderColor: 'hsl(var(--zg-border))'
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}