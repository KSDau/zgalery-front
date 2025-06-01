import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const sellItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  conservationStatus: z.string().min(1, "Conservation status is required"),
  identificationNumber: z.string().min(1, "Identification number is required"),
  saleType: z.enum(["fixed", "auction"]),
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

  const form = useForm<SellItemForm>({
    resolver: zodResolver(sellItemSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      category: "",
      brandId: "",
      conservationStatus: "",
      identificationNumber: "",
      saleType: "fixed" as const,
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
            setImages(prev => [...prev, result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const queryClient = useQueryClient();

  const createItemMutation = useMutation({
    mutationFn: async (itemData: SellItemForm) => {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...itemData,
          brandId: parseInt(itemData.brandId),
          images: images,
          status: "listed"
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Item Listed Successfully",
        description: "Your luxury item has been created and is now available in the marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      form.reset();
      setImages([]);
      // Redirect to marketplace after successful creation
      setTimeout(() => {
        setLocation("/marketplace");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SellItemForm) => {
    createItemMutation.mutate(data);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--zg-primary))' }}>
          List Your Luxury Item
        </h1>
        <p style={{ color: 'hsl(var(--zg-muted))' }}>
          Add your authenticated luxury item to the zgallery marketplace
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <CardTitle style={{ color: 'hsl(var(--zg-primary))' }}>
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
                      <FormLabel style={{ color: 'hsl(var(--zg-primary))' }}>
                        Item Name *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Vintage Rolex Submariner"
                          {...field}
                          style={{ 
                            backgroundColor: 'hsl(var(--zg-secondary))', 
                            borderColor: 'hsl(var(--zg-border))' 
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
                      <FormLabel style={{ color: 'hsl(var(--zg-primary))' }}>
                        Price *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., $35,000"
                          {...field}
                          style={{ 
                            backgroundColor: 'hsl(var(--zg-secondary))', 
                            borderColor: 'hsl(var(--zg-border))' 
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
                      <FormLabel style={{ color: 'hsl(var(--zg-primary))' }}>
                        Category *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            style={{ 
                              backgroundColor: 'hsl(var(--zg-secondary))', 
                              borderColor: 'hsl(var(--zg-border))' 
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
                          <SelectItem value="collectibles">Collectibles</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'hsl(var(--zg-primary))' }}>
                        Brand *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            style={{ 
                              backgroundColor: 'hsl(var(--zg-secondary))', 
                              borderColor: 'hsl(var(--zg-border))' 
                            }}
                          >
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Rolex</SelectItem>
                          <SelectItem value="2">Cartier</SelectItem>
                          <SelectItem value="3">Hermès</SelectItem>
                          <SelectItem value="4">Tiffany & Co.</SelectItem>
                          <SelectItem value="5">Chanel</SelectItem>
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
                    <FormLabel style={{ color: 'hsl(var(--zg-primary))' }}>
                      Description *
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed information about your item, including history, materials, craftsmanship, and any unique features..."
                        className="min-h-[120px]"
                        {...field}
                        style={{ 
                          backgroundColor: 'hsl(var(--zg-secondary))', 
                          borderColor: 'hsl(var(--zg-border))' 
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
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <CardTitle style={{ color: 'hsl(var(--zg-primary))' }}>
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
                      <FormLabel style={{ color: 'hsl(var(--zg-primary))' }}>
                        Conservation Status *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            style={{ 
                              backgroundColor: 'hsl(var(--zg-secondary))', 
                              borderColor: 'hsl(var(--zg-border))' 
                            }}
                          >
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mint">Mint - Perfect condition</SelectItem>
                          <SelectItem value="excellent">Excellent - Minor signs of use</SelectItem>
                          <SelectItem value="very-good">Very Good - Light wear</SelectItem>
                          <SelectItem value="good">Good - Moderate wear</SelectItem>
                          <SelectItem value="fair">Fair - Significant wear</SelectItem>
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
                      <FormLabel style={{ color: 'hsl(var(--zg-primary))' }}>
                        Identification Number *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Serial number, Certificate ID"
                          {...field}
                          style={{ 
                            backgroundColor: 'hsl(var(--zg-secondary))', 
                            borderColor: 'hsl(var(--zg-border))' 
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
          <Card style={{ backgroundColor: 'white', borderColor: 'hsl(var(--zg-border))' }}>
            <CardHeader>
              <CardTitle style={{ color: 'hsl(var(--zg-primary))' }}>
                Item Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label style={{ color: 'hsl(var(--zg-primary))' }}>
                  Upload Images (Maximum 8 photos)
                </Label>
                
                {/* Upload Button */}
                <div className="flex items-center space-x-4">
                  <Label 
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg transition-colors hover:bg-secondary/50"
                    style={{ 
                      borderColor: 'hsl(var(--zg-border))',
                      backgroundColor: 'hsl(var(--zg-secondary))',
                      color: 'hsl(var(--zg-muted))'
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
                  <span className="text-sm" style={{ color: 'hsl(var(--zg-muted))' }}>
                    {images.length}/8 photos uploaded
                  </span>
                </div>

                {/* Image Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: 'hsl(var(--zg-secondary))' }}>
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
                backgroundColor: 'hsl(var(--zg-secondary))',
                color: 'hsl(var(--zg-primary))',
                borderColor: 'hsl(var(--zg-border))'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-8"
              style={{ 
                backgroundColor: 'hsl(var(--zg-primary))',
                color: 'hsl(var(--zg-bg))'
              }}
            >
              List Item for Sale
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}