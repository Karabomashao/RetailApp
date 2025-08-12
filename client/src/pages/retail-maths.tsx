import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, History, Lightbulb, CheckCircle } from "lucide-react";
import { calculateRetailMetrics } from "@/lib/calculations";

interface CalculationResult {
  totalCost: number;
  unitProfit: number;
  totalProfit: number;
  grossMargin: number;
  breakEvenPrice: number;
  minPrice: number;
  targetPrice: number;
  premiumPrice: number;
}

export default function RetailMaths() {
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    purchasePrice: "",
    sellingPrice: "",
  });
  
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Calculate results in real-time if we have the required fields
    if (newFormData.quantity && newFormData.purchasePrice) {
      const quantity = parseFloat(newFormData.quantity) || 0;
      const purchasePrice = parseFloat(newFormData.purchasePrice) || 0;
      const sellingPrice = parseFloat(newFormData.sellingPrice) || 0;
      
      const calculatedResults = calculateRetailMetrics(quantity, purchasePrice, sellingPrice);
      setResults(calculatedResults);
      
      // Generate recommendation
      if (sellingPrice > 0) {
        generateRecommendation(calculatedResults, newFormData.productName);
      }
    }
  };

  const generateRecommendation = (results: CalculationResult, productName: string) => {
    const margin = results.grossMargin;
    let rec = "";
    
    if (margin < 15) {
      rec = `⚠️ MARGIN TOO LOW: ${productName || "This product"} has a ${margin.toFixed(1)}% margin, which is below the recommended 30%. Consider increasing the selling price to at least R${results.targetPrice.toFixed(2)} for a healthier 30% margin.`;
    } else if (margin < 25) {
      rec = `📈 ROOM FOR IMPROVEMENT: ${productName || "This product"} has a ${margin.toFixed(1)}% margin. While acceptable, you could optimize pricing for better profitability. Consider R${results.targetPrice.toFixed(2)} for 30% margin.`;
    } else if (margin < 35) {
      rec = `✅ GOOD MARGIN: ${productName || "This product"} has a healthy ${margin.toFixed(1)}% margin. This is within the recommended range for retail. Your pricing strategy is working well.`;
    } else {
      rec = `🎯 EXCELLENT MARGIN: ${productName || "This product"} has an excellent ${margin.toFixed(1)}% margin. This gives you flexibility for promotions or competitive pricing while maintaining profitability.`;
    }
    
    setRecommendation(rec);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form is already calculated in real-time, this could save to history
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Retail Maths Calculator</h2>
          <p className="text-text-secondary mt-2">
            Calculate cost of sales, pricing, and Gross Profit Margins for informed decision making
          </p>
        </div>
        <Button variant="outline">
          <History className="w-4 h-4 mr-2" />
          Calculation History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 text-primary mr-2" />
              Product Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity to Purchase</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="100"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price per Unit</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-text-secondary">R</span>
                    <Input
                      id="purchasePrice"
                      type="number"
                      className="pl-8"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {results && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Cost of Sales (COS)</h4>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(results.totalCost)}
                  </div>
                  <p className="text-sm text-text-secondary">Total investment required</p>
                </div>
              )}

              <div>
                <Label htmlFor="sellingPrice">Planned Selling Price per Unit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-text-secondary">R</span>
                  <Input
                    id="sellingPrice"
                    type="number"
                    className="pl-8"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {results && formData.sellingPrice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-text-primary mb-2">Profit per Unit</h4>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(results.unitProfit)}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-text-primary mb-2">Total Profit</h4>
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(results.totalProfit)}
                    </div>
                  </div>
                </div>
              )}

              {results && formData.sellingPrice && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-text-primary mb-2">Gross Margin</h4>
                  <div className="text-2xl font-bold text-orange-600">
                    {results.grossMargin.toFixed(1)}%
                  </div>
                  <p className="text-sm text-text-secondary">Profit as percentage of selling price</p>
                </div>
              )}

              <Button type="submit" className="w-full btn-primary">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate & Get Recommendation
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results and Recommendations */}
        <div className="space-y-6">
          {/* AI Recommendation */}
          <Card className="ai-insights">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 text-accent mr-2" />
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendation ? (
                  <div className="bg-blue-50 border-l-4 border-primary p-3 rounded">
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-l-4 border-primary p-3 rounded">
                    <p className="text-sm text-gray-600">
                      Enter product details above to receive personalized pricing and profitability 
                      recommendations based on market analysis and historical data.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Analysis */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Break-even Price:</span>
                    <span className="font-bold">{formatCurrency(results.breakEvenPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Recommended Min Price:</span>
                    <span className="font-bold text-orange-600">{formatCurrency(results.minPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Target Price (30% margin):</span>
                    <span className="font-bold text-green-600">{formatCurrency(results.targetPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Premium Price (40% margin):</span>
                    <span className="font-bold text-primary">{formatCurrency(results.premiumPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Aim for 30-40% gross margin in retail</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Consider competitor pricing and market positioning</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Factor in additional costs like shipping, storage</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Test different price points to optimize sales volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
