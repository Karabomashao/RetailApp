import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";
import MetricCard from "@/components/dashboard/metric-card";
import AiInsights from "@/components/dashboard/ai-insights";
import SalesChart from "@/components/charts/sales-chart";
import { getAuthHeaders } from "@/lib/authUtils";

interface DashboardMetrics {
  totalSales: number;
  grossMargin: number;
  totalProducts: number;
  lowStockCount: number;
  costOfSales: number;
  grossProfit: number;
  salesTrend: Array<{ date: string; amount: number }>;
  stockLevels: Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    isLowStock: boolean;
    isCritical: boolean;
  }>;
}

export default function Home() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/dashboard?period=current_month", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard metrics");
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
            <h2 className="text-3xl font-bold text-text-primary">Welcome to RetailPulse IQ</h2>
            <p className="text-text-secondary mt-2">Your comprehensive retail analytics and insights platform</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Welcome to RetailPulse IQ</h2>
          <p className="text-text-secondary mt-2">Your comprehensive retail analytics and insights platform</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="current_month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">This Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={formatCurrency(metrics?.totalSales || 0)}
          change="+12.5% vs last month"
          changeType="positive"
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
        />
        
        <MetricCard
          title="Gross Profit Margin"
          value={`${metrics?.grossMargin?.toFixed(1) || 0}%`}
          change="-2.1% vs last month"
          changeType="negative"
          icon={<TrendingDown className="w-6 h-6 text-accent" />}
        />
        
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts?.toString() || "0"}
          change="23 new this month"
          changeType="neutral"
          icon={<Package className="w-6 h-6 text-blue-600" />}
        />
        
        <MetricCard
          title="Low Stock Alerts"
          value={metrics?.lowStockCount?.toString() || "0"}
          change="Needs attention"
          changeType="warning"
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Charts and AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2">
          <SalesChart data={metrics?.salesTrend || []} />
        </div>

        {/* AI Insights Panel */}
        <AiInsights />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Level Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Stock Level</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.stockLevels?.slice(0, 5).map((item) => (
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
                        {item.isCritical ? "Critical" : item.isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
