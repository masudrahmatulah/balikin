"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { getCachedStockStats } from "@/lib/admin-cache";

interface StockStats {
  totalProduced: number;
  totalClaimed: number;
  lowStockThreshold: number;
  byType: {
    stickers: { produced: number; claimed: number };
    acrylic: { produced: number; claimed: number };
    bundles: { produced: number; claimed: number };
  };
}

interface StockStatusIndicatorProps {
  className?: string;
  autoRefresh?: boolean; // Auto-refresh every 30 seconds
}

/**
 * Stock Status Indicator Component
 * Shows real-time inventory status for production division
 * Displays produced vs claimed tags with low stock alerts
 */
export function StockStatusIndicator({ className = "", autoRefresh = true }: StockStatusIndicatorProps) {
  const [stats, setStats] = useState<StockStats>({
    totalProduced: 0,
    totalClaimed: 0,
    lowStockThreshold: 50,
    byType: {
      stickers: { produced: 0, claimed: 0 },
      acrylic: { produced: 0, claimed: 0 },
      bundles: { produced: 0, claimed: 0 },
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStockStats = async () => {
    try {
      // FIXED: Use cached version instead of direct API call
      const data = await getCachedStockStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch stock stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStockStats, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const unclaimedCount = stats.totalProduced - stats.totalClaimed;
  const claimRate = stats.totalProduced > 0
    ? (stats.totalClaimed / stats.totalProduced) * 100
    : 0;
  const isLowStock = unclaimedCount < stats.lowStockThreshold;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Production Stock Status</CardTitle>
          <div className="flex items-center gap-2">
            {isLowStock && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Low Stock
              </Badge>
            )}
            <Badge variant={isLowStock ? "destructive" : "default"} className="gap-1">
              <Package className="w-3 h-3" />
              {unclaimedCount} Unclaimed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Claim Rate</span>
              <span className="font-semibold">{claimRate.toFixed(1)}%</span>
            </div>
            <Progress value={claimRate} className="h-2" />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{stats.totalClaimed} claimed</span>
              <span>{stats.totalProduced} produced</span>
            </div>
          </div>

          {/* Stock by Type */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock by Type</h4>

            {/* Stickers */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Stickers</span>
                <span className="font-medium">
                  {stats.byType.stickers.produced - stats.byType.stickers.claimed} unclaimed
                </span>
              </div>
              <Progress
                value={
                  stats.byType.stickers.produced > 0
                    ? (stats.byType.stickers.claimed / stats.byType.stickers.produced) * 100
                    : 0
                }
                className="h-1.5"
              />
            </div>

            {/* Acrylic */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Acrylic Tags</span>
                <span className="font-medium">
                  {stats.byType.acrylic.produced - stats.byType.acrylic.claimed} unclaimed
                </span>
              </div>
              <Progress
                value={
                  stats.byType.acrylic.produced > 0
                    ? (stats.byType.acrylic.claimed / stats.byType.acrylic.produced) * 100
                    : 0
                }
                className="h-1.5"
              />
            </div>

            {/* Bundles */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Bundles</span>
                <span className="font-medium">
                  {stats.byType.bundles.produced - stats.byType.bundles.claimed} unclaimed
                </span>
              </div>
              <Progress
                value={
                  stats.byType.bundles.produced > 0
                    ? (stats.byType.bundles.claimed / stats.byType.bundles.produced) * 100
                    : 0
                }
                className="h-1.5"
              />
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">High Stock</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {unclaimedCount > stats.lowStockThreshold ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">Claim Rate</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {claimRate > 70 ? "Good" : "Normal"}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Package className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">Unclaimed</span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {unclaimedCount}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
