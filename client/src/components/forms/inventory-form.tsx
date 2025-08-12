import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Plus } from "lucide-react";
import { getAuthHeaders } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
}

interface InventoryFormProps {
  onClose: () => void;
}

export default function InventoryForm({ onClose }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    productId: "",
    purchasePrice: "",
    quantityReceived: "1",
    datePurchased: new Date().toISOString().split('T')[0], // Today's date
    grnNumber: "",
    description: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    description: "",
  });

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

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: (newProductData) => {
      toast({
        title: "Product created successfully",
        description: "The product has been added to your catalog.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setSelectedProduct(newProductData);
      setFormData(prev => ({
        ...prev,
        productId: newProductData.id,
        description: newProductData.description || "",
      }));
      setShowNewProductForm(false);
      setNewProduct({ sku: "", name: "", description: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  // Create inventory entry mutation
  const createInventoryMutation = useMutation({
    mutationFn: async (inventoryData: any) => {
      const response = await apiRequest("POST", "/api/inventory", {
        ...inventoryData,
        datePurchased: new Date(inventoryData.datePurchased).toISOString(),
        purchasePrice: inventoryData.purchasePrice.toString(),
        quantityReceived: parseInt(inventoryData.quantityReceived),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inventory added successfully",
        description: "The inventory entry has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add inventory",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductSelect = (productId: string) => {
    if (productId === "new") {
      setShowNewProductForm(true);
      return;
    }
    
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

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.sku || !newProduct.name) {
      toast({
        title: "Missing required fields",
        description: "Please fill in SKU and product name.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate(newProduct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.purchasePrice || !formData.quantityReceived || !formData.grnNumber) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createInventoryMutation.mutate(formData);
  };

  // Generate GRN number automatically
  const generateGRN = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `GRN-${year}${month}-${randomNum}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Inventory Entry</CardTitle>
      </CardHeader>
      <CardContent>
        {showNewProductForm ? (
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-sm mb-3">Create New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newSku">SKU *</Label>
                  <Input
                    id="newSku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Enter SKU"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newName">Product Name *</Label>
                  <Input
                    id="newName"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="newDescription">Description</Label>
                <Textarea
                  id="newDescription"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description"
                  rows={2}
                />
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending ? "Creating..." : "Create Product"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewProductForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Product *</Label>
                <Select onValueChange={handleProductSelect} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new" className="text-primary font-medium">
                      <div className="flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Product
                      </div>
                    </SelectItem>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-text-secondary">R</span>
                  <Input
                    id="purchasePrice"
                    type="number"
                    className="pl-8"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="quantityReceived">Quantity Received *</Label>
                <Input
                  id="quantityReceived"
                  type="number"
                  value={formData.quantityReceived}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantityReceived: e.target.value }))}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="datePurchased">Date Purchased *</Label>
                <Input
                  id="datePurchased"
                  type="date"
                  value={formData.datePurchased}
                  onChange={(e) => setFormData(prev => ({ ...prev, datePurchased: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="grnNumber">GRN Number *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="grnNumber"
                    value={formData.grnNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, grnNumber: e.target.value }))}
                    placeholder="GRN-2024-001"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, grnNumber: generateGRN() }))}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={createInventoryMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createInventoryMutation.isPending ? "Adding..." : "Add to Inventory"}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={onClose}
                disabled={createInventoryMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
