import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  highlight?: boolean;
  className?: string;
  trendLabel?: string;
}

interface StatCardWithChartProps extends StatCardProps {
  chartData?: number[];
}

/**
 * StatCard - Clean card for displaying metrics
 */
export function StatCard({
  label,
  value,
  trend,
  icon,
  highlight = false,
  className,
  trendLabel = "vs last period",
}: StatCardProps) {
  const trendColor = trend?.isPositive ? "text-green-600" : "text-red-600";
  const trendBg = trend?.isPositive ? "bg-green-50" : "bg-red-50";
  const trendArrow = trend?.isPositive ? "↑" : "↓";

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow",
        highlight && "border-2 border-amber-500 bg-amber-50/50",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          {trend && (
            <div className={cn("inline-flex items-center gap-1 mt-1.5", trendBg)}>
              <span className={cn("text-xs font-semibold", trendColor)}>
                {trendArrow} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              highlight
                ? "bg-amber-100 text-amber-600"
                : "bg-blue-100 text-blue-600"
            )}
          >
            <span className="text-xl">{icon}</span>
          </div>
        )}
      </div>
      <p
        className={cn(
          "font-display font-bold text-gray-900",
          highlight && "text-amber-900"
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

/**
 * StatCardWithChart - Stat card with simple bar chart visualization
 */
export function StatCardWithChart({
  label,
  value,
  chartData = [],
  trend,
  highlight = false,
  className,
  trendLabel = "vs last period",
}: StatCardWithChartProps) {
  const trendColor = trend?.isPositive ? "text-green-600" : "text-red-600";
  const trendBg = trend?.isPositive ? "bg-green-50" : "bg-red-50";
  const trendArrow = trend?.isPositive ? "↑" : "↓";

  const maxChartValue = Math.max(...chartData, 100);

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow",
        highlight && "border-2 border-amber-500 bg-amber-50/50",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          {trend && (
            <div className={cn("inline-flex items-center gap-1 mt-1.5", trendBg)}>
              <span className={cn("text-xs font-semibold", trendColor)}>
                {trendArrow} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <span className="text-xl">📊</span>
        </div>
      </div>
      <p
        className={cn(
          "font-display font-bold text-gray-900",
          highlight && "text-amber-900"
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {chartData.length > 0 && (
        <div className="flex items-end gap-1 mt-4 h-8">
          {chartData.map((height, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-100 rounded-t-sm transition-all hover:bg-blue-200"
              style={{ height: `${(height / maxChartValue) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
