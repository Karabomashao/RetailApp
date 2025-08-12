import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import InventoryForm from "@/components/forms/inventory-form";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/authUtils";

interface InventoryEntry {
  id: string;
  product: {
    name: string;
    sku: string;
  };
  purchasePrice: string;
  quantityReceived: number;
  grnNumber: string;
  datePurchased: string;
}

export default function InventoryEntry() {
  const [showForm, setShowForm] = useState(false);

  const { data: inventory, isLoading } = useQuery<InventoryEntry[]>({
    queryKey: ["/api/inventory"],
    queryFn: async () => {
      const response = await fetch("/api/inventory", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch inventory");
      return response.json();
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(parseFloat(amount));
  };

  // Calculate current stock levels (simplified)
  const stockLevels = inventory?.reduce((acc, entry) => {
    const key = entry.product?.sku || entry.id;
    if (!acc[key]) {
      acc[key] = {
        productName: entry.product?.name || 'Unknown Product',
        sku: entry.product?.sku || 'N/A',
        totalReceived: 0,
        currentStock: 0,
      };
    }
    acc[key].totalReceived += entry.quantityReceived;
    acc[key].currentStock += entry.quantityReceived; // Simplified - not accounting for sales
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Inventory Management</h2>
          <p className="text-text-secondary mt-2">Manage product inventory, track purchases and stock levels</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Inventory
          </Button>
          <Button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Entry Form */}
        <div className="lg:col-span-2">
          {showForm ? (
            <InventoryForm onClose={() => setShowForm(false)} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Ready to add inventory?</h3>
                  <p className="text-text-secondary">Click the "Add Inventory" button to start recording new stock.</p>
                  <Button 
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Inventory Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : stockLevels && Object.keys(stockLevels).length > 0 ? (
              <div className="space-y-4">
                {Object.values(stockLevels).slice(0, 10).map((item: any, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      item.currentStock < 5 
                        ? "bg-red-50" 
                        : item.currentStock < 10 
                        ? "bg-yellow-50" 
                        : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-text-secondary">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        item.currentStock < 5 
                          ? "text-red-600" 
                          : item.currentStock < 10 
                          ? "text-yellow-600" 
                          : "text-green-600"
                      }`}>
                        {item.currentStock} units
                      </p>
                      <p className={`text-xs ${
                        item.currentStock < 5 
                          ? "text-red-600" 
                          : item.currentStock < 10 
                          ? "text-yellow-600" 
                          : "text-gray-600"
                      }`}>
                        {item.currentStock < 5 ? "Critical" : item.currentStock < 10 ? "Low stock" : "In stock"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">No inventory recorded yet.</p>
                <p className="text-sm text-text-secondary mt-1">Start by adding your first inventory entry.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
