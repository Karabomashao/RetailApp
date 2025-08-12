export interface InsightData {
  totalSales: number;
  costOfSales: number;
  grossMargin: number;
  stockLevels: Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    isLowStock: boolean;
    isCritical: boolean;
  }>;
  salesTrend: Array<{
    date: string;
    amount: number;
  }>;
}

export interface AIInsight {
  type: "critical" | "warning" | "success" | "info";
  title: string;
  message: string;
  action?: string;
}

export function generateAIInsights(data: InsightData): AIInsight[] {
  const insights: AIInsight[] = [];

  // Stock level analysis
  const criticalItems = data.stockLevels.filter(item => item.isCritical);
  const lowStockItems = data.stockLevels.filter(item => item.isLowStock && !item.isCritical);

  if (criticalItems.length > 0) {
    insights.push({
      type: "critical",
      title: "Critical Stock Alert",
      message: `${criticalItems.length} product(s) have critical stock levels. Immediate reordering required to avoid stockouts.`,
      action: `Review ${criticalItems.map(item => item.sku).join(", ")} and place urgent orders.`
    });
  }

  if (lowStockItems.length > 0) {
    insights.push({
      type: "warning",
      title: "Low Stock Warning",
      message: `${lowStockItems.length} product(s) are running low on stock. Plan reorders soon to maintain inventory levels.`,
      action: `Schedule reorders for ${lowStockItems.slice(0, 3).map(item => item.sku).join(", ")}${lowStockItems.length > 3 ? " and others" : ""}.`
    });
  }

  // Margin analysis
  if (data.grossMargin < 25) {
    insights.push({
      type: "warning",
      title: "Margin Below Target",
      message: `Current gross margin of ${data.grossMargin.toFixed(1)}% is below the recommended 30%. Consider reviewing pricing strategy.`,
      action: "Analyze product costs and adjust selling prices to improve profitability."
    });
  } else if (data.grossMargin > 35) {
    insights.push({
      type: "success",
      title: "Excellent Margins",
      message: `Gross margin of ${data.grossMargin.toFixed(1)}% is excellent. You have room for competitive pricing or promotional campaigns.`,
      action: "Consider strategic discounts to drive volume while maintaining profitability."
    });
  }

  // Sales trend analysis
  if (data.salesTrend.length >= 7) {
    const recentSales = data.salesTrend.slice(-7);
    const earlierSales = data.salesTrend.slice(-14, -7);
    
    const recentAvg = recentSales.reduce((sum, sale) => sum + sale.amount, 0) / recentSales.length;
    const earlierAvg = earlierSales.reduce((sum, sale) => sum + sale.amount, 0) / earlierSales.length;
    
    if (earlierAvg > 0) {
      const growth = ((recentAvg - earlierAvg) / earlierAvg) * 100;
      
      if (growth > 15) {
        insights.push({
          type: "success",
          title: "Strong Sales Growth",
          message: `Sales are up ${growth.toFixed(1)}% over the past week. Your business is showing positive momentum.`,
          action: "Capitalize on this trend by ensuring adequate inventory and marketing support."
        });
      } else if (growth < -15) {
        insights.push({
          type: "warning",
          title: "Sales Decline",
          message: `Sales are down ${Math.abs(growth).toFixed(1)}% compared to the previous week. Investigate potential causes.`,
          action: "Review market conditions, competitor activity, and customer feedback to address the decline."
        });
      }
    }
  }

  // Seasonal insights (simplified)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 9) { // October to December
    insights.push({
      type: "info",
      title: "Seasonal Opportunity",
      message: "Q4 typically sees increased retail activity. Prepare for holiday shopping season.",
      action: "Increase inventory for popular items and plan promotional campaigns."
    });
  }

  // Inventory turnover insights
  const totalStockValue = data.stockLevels.reduce((sum, item) => sum + (item.currentStock * 100), 0); // Simplified calculation
  if (data.totalSales > 0 && totalStockValue > 0) {
    const turnoverRatio = data.totalSales / totalStockValue;
    
    if (turnoverRatio < 2) {
      insights.push({
        type: "info",
        title: "Inventory Optimization",
        message: "Some products may be moving slowly. Consider reviewing your inventory mix.",
        action: "Analyze product performance and consider markdowns for slow-moving items."
      });
    }
  }

  // If no specific insights, provide general business health message
  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "Business Health Check",
      message: "Your business metrics are within normal ranges. Continue monitoring key performance indicators.",
      action: "Focus on customer retention and explore opportunities for sustainable growth."
    });
  }

  return insights.slice(0, 5); // Limit to 5 insights
}

export function formatInsightForDisplay(insight: AIInsight): string {
  let emoji = "ℹ️";
  switch (insight.type) {
    case "critical":
      emoji = "🚨";
      break;
    case "warning":
      emoji = "⚠️";
      break;
    case "success":
      emoji = "✅";
      break;
  }
  
  return `${emoji} ${insight.title}: ${insight.message}${insight.action ? ` Recommendation: ${insight.action}` : ""}`;
}
