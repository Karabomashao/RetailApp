import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SalesDataPoint {
  date: string;
  amount: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  // Process and format data for the chart
  const processedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
    }),
    amount: item.amount,
  }));

  // Generate forecast data (simple linear projection)
  const generateForecast = () => {
    if (data.length < 2) return [];
    
    const lastFewPoints = data.slice(-7); // Use last 7 data points for trend
    const totalAmount = lastFewPoints.reduce((sum, point) => sum + point.amount, 0);
    const avgAmount = totalAmount / lastFewPoints.length;
    
    const forecastData = [];
    const lastDate = new Date(data[data.length - 1]?.date || new Date());
    
    for (let i = 1; i <= 30; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(lastDate.getDate() + i);
      
      // Simple trend calculation with some variation
      const trendMultiplier = 1 + (Math.random() - 0.5) * 0.2; // ±10% variation
      const forecastAmount = avgAmount * trendMultiplier;
      
      forecastData.push({
        date: forecastDate.toLocaleDateString("en-ZA", {
          month: "short",
          day: "numeric",
        }),
        amount: forecastAmount,
        isForecast: true,
      });
    }
    
    return forecastData;
  };

  const forecastData = generateForecast();
  const combinedData = [...processedData, ...forecastData];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#6B7280' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    formatCurrency(value), 
                    props.payload.isForecast ? "Forecast" : "Actual Sales"
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(220, 83%, 31%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(220, 83%, 31%)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(220, 83%, 31%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-sm">No sales data available</p>
                <p className="text-xs mt-1">Chart will appear when sales are recorded</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
