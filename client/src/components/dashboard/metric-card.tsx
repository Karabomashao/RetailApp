import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  icon: ReactNode;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "warning":
        return "text-orange-600";
      default:
        return "text-text-secondary";
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return "↗";
      case "negative":
        return "↘";
      case "warning":
        return "⚠";
      default:
        return "";
    }
  };

  return (
    <Card className="dashboard-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            {change && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${getChangeColor()}`}>
                <span>{getChangeIcon()}</span>
                {change}
              </p>
            )}
          </div>
          <div className="bg-primary bg-opacity-10 p-3 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
