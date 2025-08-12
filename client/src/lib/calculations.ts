export interface RetailMetrics {
  totalCost: number;
  unitProfit: number;
  totalProfit: number;
  grossMargin: number;
  breakEvenPrice: number;
  minPrice: number;
  targetPrice: number;
  premiumPrice: number;
}

export function calculateRetailMetrics(
  quantity: number,
  purchasePrice: number,
  sellingPrice: number = 0
): RetailMetrics {
  // Basic calculations
  const totalCost = quantity * purchasePrice;
  const unitProfit = sellingPrice - purchasePrice;
  const totalProfit = quantity * unitProfit;
  const grossMargin = sellingPrice > 0 ? (unitProfit / sellingPrice) * 100 : 0;

  // Pricing recommendations
  const breakEvenPrice = purchasePrice;
  const minPrice = purchasePrice * 1.15; // 15% margin
  const targetPrice = purchasePrice / 0.7; // 30% margin (price = cost / (1 - margin%))
  const premiumPrice = purchasePrice / 0.6; // 40% margin

  return {
    totalCost,
    unitProfit,
    totalProfit,
    grossMargin,
    breakEvenPrice,
    minPrice,
    targetPrice,
    premiumPrice,
  };
}

export function calculateInventoryTurnover(
  costOfGoodsSold: number,
  averageInventoryValue: number
): number {
  if (averageInventoryValue === 0) return 0;
  return costOfGoodsSold / averageInventoryValue;
}

export function calculateGrossProfitMargin(
  revenue: number,
  costOfGoodsSold: number
): number {
  if (revenue === 0) return 0;
  return ((revenue - costOfGoodsSold) / revenue) * 100;
}

export function calculateMarkup(costPrice: number, sellingPrice: number): number {
  if (costPrice === 0) return 0;
  return ((sellingPrice - costPrice) / costPrice) * 100;
}

export function calculateMargin(costPrice: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

export function calculateBreakEvenUnits(
  fixedCosts: number,
  pricePerUnit: number,
  variableCostPerUnit: number
): number {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) return 0;
  return fixedCosts / contributionMargin;
}

export function calculateReorderPoint(
  leadTimeDays: number,
  dailySalesRate: number,
  safetyStock: number = 0
): number {
  return (leadTimeDays * dailySalesRate) + safetyStock;
}

export function calculateEconomicOrderQuantity(
  annualDemand: number,
  orderingCost: number,
  holdingCostPerUnit: number
): number {
  if (holdingCostPerUnit === 0) return 0;
  return Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit);
}

export function calculatePriceFromMargin(costPrice: number, targetMargin: number): number {
  if (targetMargin >= 100) return 0; // Cannot have 100% or higher margin
  return costPrice / (1 - targetMargin / 100);
}

export function calculatePriceFromMarkup(costPrice: number, markup: number): number {
  return costPrice * (1 + markup / 100);
}

export function formatCurrency(amount: number, currency: string = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Forecasting functions
export function calculateSimpleMovingAverage(data: number[], periods: number): number[] {
  const result: number[] = [];
  
  for (let i = periods - 1; i < data.length; i++) {
    const sum = data.slice(i - periods + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / periods);
  }
  
  return result;
}

export function calculateExponentialMovingAverage(
  data: number[],
  alpha: number = 0.3
): number[] {
  const result: number[] = [];
  
  if (data.length === 0) return result;
  
  // First value is the same as simple average
  result.push(data[0]);
  
  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(ema);
  }
  
  return result;
}

export function forecastSales(
  historicalData: number[],
  periodsToForecast: number,
  method: "sma" | "ema" = "sma"
): number[] {
  if (historicalData.length < 3) {
    // Not enough data for meaningful forecast
    return Array(periodsToForecast).fill(0);
  }
  
  let trendData: number[];
  
  if (method === "sma") {
    trendData = calculateSimpleMovingAverage(historicalData, Math.min(3, historicalData.length));
  } else {
    trendData = calculateExponentialMovingAverage(historicalData);
  }
  
  const lastTrend = trendData[trendData.length - 1] || 0;
  const secondLastTrend = trendData[trendData.length - 2] || lastTrend;
  const trend = lastTrend - secondLastTrend;
  
  const forecast: number[] = [];
  for (let i = 0; i < periodsToForecast; i++) {
    const forecastValue = Math.max(0, lastTrend + trend * (i + 1));
    forecast.push(forecastValue);
  }
  
  return forecast;
}
