import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
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
  icon: Icon,
  highlight = false,
  className,
  trendLabel = "vs last period",
}: StatCardProps) {
  const trendColor = trend?.isPositive ? "text-green-600" : "text-red-600";
  const trendBg = trend?.isPositive ? "bg-green-50" : "bg-red-50";
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all",
        highlight && "border-2 border-tertiary/40 bg-tertiary/[0.03]",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          {trend && (
            <div className={cn("inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full", trendBg)}>
              <TrendIcon size={12} className={trendColor} />
              <span className={cn("text-xs font-semibold", trendColor)}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              highlight
                ? "bg-tertiary/10 text-tertiary"
                : "bg-primary/5 text-primary"
            )}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>
      <p
        className={cn(
          "font-display font-bold text-2xl text-primary",
          highlight && "text-tertiary"
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
  icon: Icon = BarChart3,
  highlight = false,
  className,
  trendLabel = "vs last period",
}: StatCardWithChartProps) {
  const trendColor = trend?.isPositive ? "text-green-600" : "text-red-600";
  const trendBg = trend?.isPositive ? "bg-green-50" : "bg-red-50";
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;

  const maxChartValue = Math.max(...chartData, 100);

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all",
        highlight && "border-2 border-tertiary/40 bg-tertiary/[0.03]",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          {trend && (
            <div className={cn("inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full", trendBg)}>
              <TrendIcon size={12} className={trendColor} />
              <span className={cn("text-xs font-semibold", trendColor)}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <p
        className={cn(
          "font-display font-bold text-2xl text-primary",
          highlight && "text-tertiary"
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {chartData.length > 0 && (
        <div className="flex items-end gap-1 mt-4 h-8">
          {chartData.map((height, index) => (
            <div
              key={index}
              className="flex-1 bg-primary/10 rounded-t-sm transition-all hover:bg-tertiary/30"
              style={{ height: `${(height / maxChartValue) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
