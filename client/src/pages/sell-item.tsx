import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  Transaction,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

const sellItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  brand: "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc",
  conservationStatus: z.string().min(1, "Conservation status is required"),
  identificationNumber: z.string().min(1, "Identification number is required"),
});

type SellItemForm = z.infer<typeof sellItemSchema>;

/**
 * SellItem component that allows users to list luxury items for sale
 * with detailed information and multiple image uploads.
 */
export default function SellItem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const {
    connected: isWalletConnected,
    publicKey,
    requestTransaction,
  } = useWallet();
  const [isTransacting, setIsTransacting] = useState(false);
  const address = publicKey?.toString() || null;

  const form = useForm<SellItemForm>({
    resolver: zodResolver(sellItemSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      category: "",
      brand: "",
      conservationStatus: "",
      identificationNumber: "",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result) {
            setImages((prev) => [...prev, result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SellItemForm) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Leo Wallet to mint and list NFTs.",
        variant: "destructive",
      });
      return;
    }

    setIsTransacting(true);

    try {
      // Step 1: Request wallet transaction to mint NFT on Aleo blockchain
      console.log("Mint transaction:", data);

      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      // Prepare inputs for the mint_private function
      // The contract expects: data struct (metadata, brand, form) and edition scalar
      const metadataField = `${Math.floor(Math.random() * 1000000)}field`;
      const brandAddress =
        "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc"; // Generic null address
      const formField = `${data.category.toLowerCase().charCodeAt(0)}field`;
      const editionScalar = `${Date.now()}scalar`;

      const inputs = [
        `{ metadata: ${metadataField}, brand: ${brandAddress}, form: ${formField} }`, // data struct
        editionScalar, // edition scalar
      ];

      const fee = 10_000; // Fee in microcredits (0.01 Aleo) - reduced for testing

      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        "zgallery_nft.aleo",
        "mint_private",
        inputs,
        fee,
      );

      toast({
        title: "Please Sign Transaction",
        description: "Confirm the NFT minting transaction in your Leo Wallet.",
      });

      if (!requestTransaction) {
        throw new Error("Transaction function not available");
      }

      const transactionId = await requestTransaction(aleoTransaction);

      if (!transactionId) {
        throw new Error("Transaction was rejected or failed");
      }

      // Step 2: Create NFT record in backend after successful blockchain transaction
      const nftData = {
        owner: address || "unknown",
        metadata: JSON.stringify({
          name: data.name,
          description: data.description,
          category: data.category,
          conservationStatus: data.conservationStatus,
          identificationNumber: data.identificationNumber,
          images:
            images.length > 0
              ? images
              : [
                  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
                ],
        }),
        brand: data.brand,
        form: data.category.toLowerCase(),
        edition: `edition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nftCommit:
          transactionId ||
          `commit_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`,
        isPrivate: true,
      };

      // Create NFT via API
      const nftResponse = await fetch("/api/nfts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nftData),
      });

      if (!nftResponse.ok) {
        throw new Error("Failed to create NFT record");
      }

      const nft = await nftResponse.json();

      // Create marketplace listing
      const priceInMicrocredits = Math.floor(
        parseFloat(data.price.replace(/[$,]/g, "")) * 1_000_000,
      );

      const listingData = {
        listingId: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nftCommit: nft.nftCommit,
        seller: address || "unknown",
        price: priceInMicrocredits,
        listingPublicKey: `pubkey_${Math.random().toString(36).substr(2, 20)}`,
        purchased: null,
        approved: null,
        buyerCommit: null,
        purchaseN: null,
        buyer: null,
      };

      const listingResponse = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });

      if (!listingResponse.ok) {
        throw new Error("Failed to create listing");
      }

      toast({
        title: "Item Listed Successfully",
        description: `Your ${data.name} has been minted as an NFT and listed on the marketplace.`,
      });

      // Reset form and redirect
      form.reset();
      setImages([]);
      setLocation("/marketplace");
    } catch (error: any) {
      console.error("Error listing item:", error);
      toast({
        title: "Error",
        description: "Failed to list your item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/marketplace")}
          className="mb-4 p-0 h-auto font-normal"
          style={{ color: "hsl(var(--zg-muted))" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "hsl(var(--zg-primary))" }}
        >
          List Your Luxury Item
        </h1>
        <p style={{ color: "hsl(var(--zg-muted))" }}>
          Add your authenticated luxury item to the zgallery marketplace
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card
            style={{
              backgroundColor: "white",
              borderColor: "hsl(var(--zg-border))",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "hsl(var(--zg-primary))" }}>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(var(--zg-primary))" }}>
                        Item Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Vintage Rolex Submariner"
                          {...field}
                          style={{
                            backgroundColor: "hsl(var(--zg-secondary))",
                            borderColor: "hsl(var(--zg-border))",
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(var(--zg-primary))" }}>
                        Price *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., $35,000"
                          {...field}
                          style={{
                            backgroundColor: "hsl(var(--zg-secondary))",
                            borderColor: "hsl(var(--zg-border))",
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(var(--zg-primary))" }}>
                        Category *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            style={{
                              backgroundColor: "hsl(var(--zg-secondary))",
                              borderColor: "hsl(var(--zg-border))",
                            }}
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="watches">Watches</SelectItem>
                          <SelectItem value="jewelry">Jewelry</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="collectibles">
                            Collectibles
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(var(--zg-primary))" }}>
                        Brand *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            style={{
                              backgroundColor: "hsl(var(--zg-secondary))",
                              borderColor: "hsl(var(--zg-border))",
                            }}
                          >
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rolex">Rolex</SelectItem>
                          <SelectItem value="cartier">Cartier</SelectItem>
                          <SelectItem value="tiffany">Tiffany & Co.</SelectItem>
                          <SelectItem value="hermes">Hermès</SelectItem>
                          <SelectItem value="chanel">Chanel</SelectItem>
                          <SelectItem value="louis-vuitton">
                            Louis Vuitton
                          </SelectItem>
                          <SelectItem value="patek-philippe">
                            Patek Philippe
                          </SelectItem>
                          <SelectItem value="omega">Omega</SelectItem>
                          <SelectItem value="bulgari">Bulgari</SelectItem>
                          <SelectItem value="van-cleef">
                            Van Cleef & Arpels
                          </SelectItem>
                          <SelectItem value="basquiat">
                            Jean-Michel Basquiat
                          </SelectItem>
                          <SelectItem value="picasso">Pablo Picasso</SelectItem>
                          <SelectItem value="warhol">Andy Warhol</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "hsl(var(--zg-primary))" }}>
                      Description *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed information about your item, including history, materials, craftsmanship, and any unique features..."
                        className="min-h-[120px]"
                        {...field}
                        style={{
                          backgroundColor: "hsl(var(--zg-secondary))",
                          borderColor: "hsl(var(--zg-border))",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Authentication Details */}
          <Card
            style={{
              backgroundColor: "white",
              borderColor: "hsl(var(--zg-border))",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "hsl(var(--zg-primary))" }}>
                Authentication & Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="conservationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(var(--zg-primary))" }}>
                        Conservation Status *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            style={{
                              backgroundColor: "hsl(var(--zg-secondary))",
                              borderColor: "hsl(var(--zg-border))",
                            }}
                          >
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mint">
                            Mint - Perfect condition
                          </SelectItem>
                          <SelectItem value="excellent">
                            Excellent - Minor signs of use
                          </SelectItem>
                          <SelectItem value="very-good">
                            Very Good - Light wear
                          </SelectItem>
                          <SelectItem value="good">
                            Good - Moderate wear
                          </SelectItem>
                          <SelectItem value="fair">
                            Fair - Significant wear
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identificationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(var(--zg-primary))" }}>
                        Identification Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Serial number, Certificate ID"
                          {...field}
                          style={{
                            backgroundColor: "hsl(var(--zg-secondary))",
                            borderColor: "hsl(var(--zg-border))",
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card
            style={{
              backgroundColor: "white",
              borderColor: "hsl(var(--zg-border))",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "hsl(var(--zg-primary))" }}>
                Item Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label style={{ color: "hsl(var(--zg-primary))" }}>
                  Upload Images (Maximum 8 photos)
                </Label>

                {/* Upload Button */}
                <div className="flex items-center space-x-4">
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg transition-colors hover:bg-secondary/50"
                    style={{
                      borderColor: "hsl(var(--zg-border))",
                      backgroundColor: "hsl(var(--zg-secondary))",
                      color: "hsl(var(--zg-muted))",
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Photos
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span
                    className="text-sm"
                    style={{ color: "hsl(var(--zg-muted))" }}
                  >
                    {images.length}/8 photos uploaded
                  </span>
                </div>

                {/* Image Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div
                          className="aspect-square rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: "hsl(var(--zg-secondary))",
                          }}
                        >
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/marketplace")}
              style={{
                backgroundColor: "hsl(var(--zg-secondary))",
                color: "hsl(var(--zg-primary))",
                borderColor: "hsl(var(--zg-border))",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8"
              disabled={isTransacting || !isWalletConnected}
              style={{
                backgroundColor: "hsl(var(--zg-primary))",
                color: "hsl(var(--zg-bg))",
              }}
            >
              {isTransacting
                ? "Minting NFT..."
                : !isWalletConnected
                  ? "Connect Wallet First"
                  : "List Item for Sale"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
