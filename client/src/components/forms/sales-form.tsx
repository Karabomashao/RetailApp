import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { getAuthHeaders } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
}

interface SalesFormProps {
  onClose: () => void;
}

export default function SalesForm({ onClose }: SalesFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    productId: "",
    salesPrice: "",
    quantitySold: "1",
    dataSold: new Date().toISOString().split('T')[0], // Today's date
    description: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products for the dropdown
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await apiRequest("POST", "/api/sales", {
        ...saleData,
        dateSold: new Date(saleData.dataSold).toISOString(),
        salesPrice: saleData.salesPrice.toString(),
        quantitySold: parseInt(saleData.quantitySold),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sale recorded successfully",
        description: "The sale has been added to your records.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record sale",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductSelect = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        productId,
        description: product.description || "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.salesPrice || !formData.quantitySold) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createSaleMutation.mutate({
      productId: formData.productId,
      salesPrice: formData.salesPrice,
      quantitySold: formData.quantitySold,
      dataSold: formData.dataSold,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Sale Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product">Product *</Label>
              <Select onValueChange={handleProductSelect} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {productsLoading ? (
                    <SelectItem value="loading" disabled>Loading products...</SelectItem>
                  ) : products && products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-products" disabled>No products available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={selectedProduct?.sku || ""}
                placeholder="SKU Code"
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Product description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salesPrice">Sales Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-text-secondary">R</span>
                <Input
                  id="salesPrice"
                  type="number"
                  className="pl-8"
                  value={formData.salesPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, salesPrice: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="quantitySold">Quantity Sold *</Label>
              <Input
                id="quantitySold"
                type="number"
                value={formData.quantitySold}
                onChange={(e) => setFormData(prev => ({ ...prev, quantitySold: e.target.value }))}
                placeholder="1"
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="dataSold">Data Sold *</Label>
              <Input
                id="dataSold"
                type="date"
                value={formData.dataSold}
                onChange={(e) => setFormData(prev => ({ ...prev, dataSold: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="btn-primary"
              disabled={createSaleMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createSaleMutation.isPending ? "Saving..." : "Save Sale"}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={onClose}
              disabled={createSaleMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>

        {products && products.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No products found. You need to add products first before recording sales.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
