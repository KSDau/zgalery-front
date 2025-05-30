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
  MessageSquare, 
  Users, 
  TrendingUp, 
  Package,
  Search,
  Filter,
  Download
} from "lucide-react";
import { luxuryItems } from "@/data/luxury-items";
import { useToast } from "@/hooks/use-toast";

interface Owner {
  id: string;
  address: string;
  purchaseDate: string;
  purchasePrice: string;
  status: "active" | "transferred";
}

interface CreatorItem {
  id: number;
  name: string;
  category: string;
  totalSupply: number;
  currentOwners: number;
  floorPrice: string;
  totalVolume: string;
  status: "active" | "paused" | "sold-out";
  image: string;
  owners: Owner[];
}

/**
 * CreatorDashboard component that allows brands to manage their luxury items,
 * view ownership data, and interact with current owners.
 */
export default function CreatorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<CreatorItem | null>(null);

  // Mock creator items data based on luxury items
  const creatorItems: CreatorItem[] = luxuryItems.slice(0, 4).map((item, index) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    totalSupply: 1,
    currentOwners: 1,
    floorPrice: item.price,
    totalVolume: item.price,
    status: index % 3 === 0 ? "sold-out" : index % 3 === 1 ? "active" : "paused",
    image: item.image,
    owners: [
      {
        id: "1",
        address: "0x742d35Cc6664C8532d2aFa19B8e9FACcE25F0e8a",
        purchaseDate: "2024-01-15",
        purchasePrice: item.price,
        status: "active"
      }
    ]
  }));

  const filteredItems = creatorItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewItem = (item: CreatorItem) => {
    setSelectedItem(item);
  };

  const handleEditItem = (itemId: number) => {
    toast({
      title: "Edit Item",
      description: "This would open the item editing interface.",
    });
  };

  const handleContactOwner = (owner: Owner) => {
    toast({
      title: "Contact Owner",
      description: `This would open a messaging interface to contact ${owner.address.substring(0, 6)}...${owner.address.substring(38)}`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your ownership data is being prepared for download.",
    });
  };

  const totalStats = {
    totalItems: creatorItems.length,
    activeItems: creatorItems.filter(item => item.status === "active").length,
    totalOwners: creatorItems.reduce((sum, item) => sum + item.currentOwners, 0),
    totalVolume: creatorItems.reduce((sum, item) => sum + parseInt(item.totalVolume.replace(/[$,]/g, "")), 0)
  };

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
              Creator Dashboard
            </h1>
            <p style={{ color: 'hsl(var(--zg-muted))' }}>
              Manage your luxury items and interact with current owners
            </p>
          </div>
          <Button 
            onClick={() => setLocation("/sell")}
            style={{ 
              backgroundColor: 'hsl(var(--zg-primary))',
              color: 'hsl(var(--zg-bg))'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--zg-muted))' }}>
                  Total Items
                </p>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                  {totalStats.totalItems}
                </p>
              </div>
              <Package className="h-8 w-8" style={{ color: 'hsl(var(--zg-muted))' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--zg-muted))' }}>
                  Active Items
                </p>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                  {totalStats.activeItems}
                </p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: 'hsl(var(--zg-muted))' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--zg-muted))' }}>
                  Total Owners
                </p>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                  {totalStats.totalOwners}
                </p>
              </div>
              <Users className="h-8 w-8" style={{ color: 'hsl(var(--zg-muted))' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--zg-muted))' }}>
                  Total Volume
                </p>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--zg-primary))' }}>
                  ${(totalStats.totalVolume / 1000).toFixed(0)}k
                </p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: 'hsl(var(--zg-muted))' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">My Items</TabsTrigger>
          <TabsTrigger value="owners">Owner Management</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4" style={{ color: 'hsl(var(--zg-muted))' }} />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                  style={{ 
                    backgroundColor: 'hsl(var(--zg-secondary))', 
                    borderColor: 'hsl(var(--zg-border))' 
                  }}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" style={{ backgroundColor: 'hsl(var(--zg-secondary))', borderColor: 'hsl(var(--zg-border))' }}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="sold-out">Sold Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              style={{ 
                backgroundColor: 'hsl(var(--zg-secondary))',
                color: 'hsl(var(--zg-primary))',
                borderColor: 'hsl(var(--zg-border))'
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
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
                    <Badge 
                      variant={item.status === "active" ? "default" : item.status === "sold-out" ? "secondary" : "destructive"}
                      className={
                        item.status === "active" ? "bg-green-100 text-green-800" :
                        item.status === "sold-out" ? "bg-gray-100 text-gray-800" :
                        "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span style={{ color: 'hsl(var(--zg-muted))' }}>Owners:</span>
                      <span style={{ color: 'hsl(var(--zg-primary))' }}>{item.currentOwners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'hsl(var(--zg-muted))' }}>Floor Price:</span>
                      <span style={{ color: 'hsl(var(--zg-primary))' }}>{item.floorPrice}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewItem(item)}
                      className="flex-1"
                      style={{ 
                        backgroundColor: 'hsl(var(--zg-secondary))',
                        color: 'hsl(var(--zg-primary))',
                        borderColor: 'hsl(var(--zg-border))'
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditItem(item.id)}
                      className="flex-1"
                      style={{ 
                        backgroundColor: 'hsl(var(--zg-secondary))',
                        color: 'hsl(var(--zg-primary))',
                        borderColor: 'hsl(var(--zg-border))'
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="owners" className="space-y-6">
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <CardTitle style={{ color: 'hsl(var(--zg-primary))' }}>
                Current Owners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Owner Address</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creatorItems.flatMap(item => 
                    item.owners.map(owner => (
                      <TableRow key={`${item.id}-${owner.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {owner.address.substring(0, 6)}...{owner.address.substring(38)}
                        </TableCell>
                        <TableCell>{owner.purchaseDate}</TableCell>
                        <TableCell>{owner.purchasePrice}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={owner.status === "active" ? "default" : "secondary"}
                            className={owner.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {owner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleContactOwner(owner)}
                            style={{ 
                              backgroundColor: 'hsl(var(--zg-secondary))',
                              color: 'hsl(var(--zg-primary))',
                              borderColor: 'hsl(var(--zg-border))'
                            }}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Item Detail Modal would go here if selectedItem is not null */}
    </main>
  );
}