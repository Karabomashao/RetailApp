import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertTriangle, TrendingUp, Lightbulb, AlertCircle } from "lucide-react";
import { getAuthHeaders } from "@/lib/authUtils";

interface AIInsight {
  type: "critical" | "warning" | "success" | "info";
  title: string;
  message: string;
  action?: string;
}

interface AIInsightsResponse {
  insights: AIInsight[];
}

export default function AiInsights() {
  const { data: insightsData, isLoading } = useQuery<AIInsightsResponse>({
    queryKey: ["/api/ai/insights"],
    queryFn: async () => {
      const response = await fetch("/api/ai/insights", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch AI insights");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "success":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-400";
      case "warning":
        return "border-yellow-400";
      case "success":
        return "border-green-400";
      default:
        return "border-blue-400";
    }
  };

  const getInsightBackgroundColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      case "success":
        return "bg-green-50";
      default:
        return "bg-blue-50";
    }
  };

  if (isLoading) {
    return (
      <Card className="ai-insights">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 text-accent mr-2" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = insightsData?.insights || [];

  return (
    <Card className="ai-insights">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-5 h-5 text-accent mr-2" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.slice(0, 4).map((insight, index) => (
              <div
                key={index}
                className={`${getInsightBackgroundColor(insight.type)} border-l-4 ${getInsightBorderColor(insight.type)} p-3 rounded`}
              >
                <div className="flex items-start">
                  {getInsightIcon(insight.type)}
                  <div className="ml-2 flex-1">
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
                    {insight.action && (
                      <p className="text-xs font-medium text-gray-700 mt-2">
                        💡 {insight.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <div className="flex items-start">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <div className="ml-2">
                  <p className="font-medium text-sm">Business Health Check</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Your business metrics are being analyzed. Insights will appear here as data is processed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
