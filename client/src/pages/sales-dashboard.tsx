import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Calculator, Percent, TrendingUp } from "lucide-react";
import MetricCard from "@/components/dashboard/metric-card";
import AiInsights from "@/components/dashboard/ai-insights";
import SalesChart from "@/components/charts/sales-chart";
import { getAuthHeaders } from "@/lib/authUtils";

export default function SalesDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard", "sales"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/dashboard?period=last_3_months", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch sales analytics");
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
            <h2 className="text-3xl font-bold text-text-primary">Sales Analytics</h2>
            <p className="text-text-secondary mt-2">Comprehensive sales performance and forecasting dashboard</p>
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
          <h2 className="text-3xl font-bold text-text-primary">Sales Analytics</h2>
          <p className="text-text-secondary mt-2">Comprehensive sales performance and forecasting dashboard</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="last_3_months">
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Month Sales"
          value={formatCurrency(metrics?.totalSales * 0.3 || 0)} // Approximate current month
          change="Target: R 95,000"
          changeType="neutral"
          icon={<Calendar className="w-6 h-6 text-primary" />}
        />
        
        <MetricCard
          title="Last 3 Months"
          value={formatCurrency(metrics?.totalSales || 0)}
          change="+18.5% growth"
          changeType="positive"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        
        <MetricCard
          title="Cost of Sales"
          value={formatCurrency(metrics?.costOfSales || 0)}
          change={`${((metrics?.costOfSales || 0) / (metrics?.totalSales || 1) * 100).toFixed(1)}% of total sales`}
          changeType="neutral"
          icon={<Calculator className="w-6 h-6 text-orange-600" />}
        />
        
        <MetricCard
          title="Gross Profit Margin"
          value={`${metrics?.grossMargin?.toFixed(1) || 0}%`}
          change="-2.1% vs target"
          changeType="negative"
          icon={<Percent className="w-6 h-6 text-accent" />}
        />
      </div>

      {/* Charts and Forecasting Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend and Forecast Chart */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sales Performance & Forecast</CardTitle>
              <div className="flex space-x-2">
                <Button variant="default" size="sm">Actual</Button>
                <Button variant="outline" size="sm">Forecast</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SalesChart data={metrics?.salesTrend || []} />
          </CardContent>
        </Card>

        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.stockLevels?.slice(0, 5).map((product: any, index: number) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.productName}</p>
                      <p className="text-xs text-text-secondary">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency((index + 1) * 5000)} {/* Mock sales data */}
                    </p>
                    <p className="text-xs text-text-secondary">{product.currentStock} units</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-text-secondary">No sales data available yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights for Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-placeholder h-64 rounded-lg flex items-center justify-center text-white">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 mb-4 mx-auto" />
                  <p className="text-lg font-semibold">Detailed Performance Analysis</p>
                  <p className="text-sm opacity-75">Breakdown by category, time periods</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AiInsights />
      </div>
    </div>
  );
}
