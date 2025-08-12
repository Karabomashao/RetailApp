import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Package, AlertTriangle, TrendingUp, Boxes } from "lucide-react";
import MetricCard from "@/components/dashboard/metric-card";
import { getAuthHeaders } from "@/lib/authUtils";

export default function InventoryDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard", "inventory"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/dashboard?period=current_month", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch inventory analytics");
      return response.json();
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency", 
      currency: "ZAR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Inventory Analytics</h2>
            <p className="text-text-secondary mt-2">Monitor stock levels, turnover, and inventory performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalInventoryValue = metrics?.stockLevels?.reduce((sum: number, item: any) => {
    return sum + (item.currentStock * 100); // Mock price calculation
  }, 0) || 0;

  const lowStockItems = metrics?.stockLevels?.filter((item: any) => item.isLowStock) || [];
  const criticalItems = metrics?.stockLevels?.filter((item: any) => item.isCritical) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Inventory Analytics</h2>
          <p className="text-text-secondary mt-2">Monitor stock levels, turnover, and inventory performance</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="current_month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts?.toString() || "0"}
          change="Active inventory items"
          changeType="neutral"
          icon={<Package className="w-6 h-6 text-primary" />}
        />
        
        <MetricCard
          title="Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          change="Current stock value"
          changeType="neutral"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        
        <MetricCard
          title="Low Stock Items"
          value={lowStockItems.length.toString()}
          change="Need reordering"
          changeType="warning"
          icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
        />
        
        <MetricCard
          title="Critical Stock"
          value={criticalItems.length.toString()}
          change="Immediate attention"
          changeType="negative"
          icon={<Boxes className="w-6 h-6 text-red-600" />}
        />
      </div>

      {/* Inventory Overview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Levels by Product */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.stockLevels?.slice(0, 8).map((item: any) => (
                    <tr key={item.productId} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{item.productName}</td>
                      <td className="py-3 px-4 text-sm">{item.sku}</td>
                      <td className="py-3 px-4 text-sm">{item.currentStock} units</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.isCritical
                            ? "bg-red-100 text-red-800"
                            : item.isLowStock
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {item.isCritical ? "Critical" : item.isLowStock ? "Low" : "Good"}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-secondary">
                        No inventory data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Reorder Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              Reorder Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.slice(0, 6).map((item: any, index: number) => (
                  <div key={item.productId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{item.productName}</h4>
                        <p className="text-xs text-text-secondary">SKU: {item.sku}</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Current stock: {item.currentStock} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-800">
                          Reorder: {Math.max(30 - item.currentStock, 20)} units
                        </p>
                        <p className="text-xs text-yellow-600">
                          Est. cost: {formatCurrency((Math.max(30 - item.currentStock, 20)) * 50)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium text-green-800">All Good!</h3>
                <p className="text-sm text-green-600 mt-1">No immediate reorders needed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Turnover Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-placeholder h-64 rounded-lg flex items-center justify-center text-white">
            <div className="text-center">
              <Boxes className="w-16 h-16 mb-4 mx-auto" />
              <p className="text-lg font-semibold">Inventory Turnover Chart</p>
              <p className="text-sm opacity-75">Track product movement and turnover rates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
