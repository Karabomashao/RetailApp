import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import SalesForm from "@/components/forms/sales-form";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/authUtils";

interface Sale {
  id: string;
  product: {
    name: string;
    sku: string;
  };
  salesPrice: string;
  quantitySold: number;
  dataSold: string;
  createdAt: string;
}

export default function SalesEntry() {
  const [showForm, setShowForm] = useState(false);

  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    queryFn: async () => {
      const response = await fetch("/api/sales", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Sales Data Entry</h2>
          <p className="text-text-secondary mt-2">Record new sales transactions and manage product sales data</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Entry Form */}
        <div className="lg:col-span-2">
          {showForm ? (
            <SalesForm onClose={() => setShowForm(false)} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Ready to record a sale?</h3>
                  <p className="text-text-secondary">Click the "New Sale" button to start entering sales data.</p>
                  <Button 
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Sale
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : sales && sales.length > 0 ? (
              <div className="space-y-3">
                {sales.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{sale.product?.name || 'Unknown Product'}</p>
                        <p className="text-xs text-text-secondary">SKU: {sale.product?.sku || 'N/A'}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-medium">
                          {formatCurrency(sale.salesPrice)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Qty: {sale.quantitySold}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">No sales recorded yet.</p>
                <p className="text-sm text-text-secondary mt-1">Start by adding your first sale.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
