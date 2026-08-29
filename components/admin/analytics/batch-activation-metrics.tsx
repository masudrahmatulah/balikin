"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBatchActivationMetrics } from "@/app/admin/actions/overview-actions";
import { RefreshCw, AlertTriangle, CheckCircle2, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BundleMetric {
  institution: string;
  bundleType: string;
  totalItems: number;
  claimedItems: number;
  activationRate: number;
  deliveredAt: string | null;
}

interface BatchActivationData {
  totalBundles: number;
  averageActivationRate: number;
  lowActivationBundles: BundleMetric[];
  bundles: BundleMetric[];
}

export function BatchActivationMetrics() {
  const [data, setData] = useState<BatchActivationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [showAllBundles, setShowAllBundles] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const result = await getBatchActivationMetrics();
      setData(result);
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const getActivationRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getActivationRateBg = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const formatDeliveryDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" aria-hidden="true" />
            Batch Activation Metrics
          </CardTitle>
          <CardDescription className="mt-1">
            Bundle activation rates by institution
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh bundle metrics"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" aria-live="polite">
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="alert" aria-live="assertive">
            Failed to load bundle metrics
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3" role="list" aria-label="Bundle summary statistics">
              <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg" role="listitem">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.totalBundles}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Bundles</p>
              </div>

              <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg" role="listitem">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.averageActivationRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Activation</p>
              </div>

              <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg" role="listitem">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.lowActivationBundles.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Needs Attention</p>
              </div>

              <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg" role="listitem">
                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.bundles.filter(b => b.activationRate >= 80).length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">On Track</p>
              </div>
            </div>

            {data.lowActivationBundles.length > 0 && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {data.lowActivationBundles.length} institution(s) need attention
                  </p>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Activation rate below 50% - may require follow-up education
                </p>
              </div>
            )}

            {data.bundles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Institution Activation Rates
                </p>
                <div className="space-y-2" role="list" aria-label="Bundle activation list">
                  {(showAllBundles ? data.bundles : data.bundles.slice(0, 6)).map((bundle, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      role="listitem"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {bundle.institution}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Delivered: {formatDeliveryDate(bundle.deliveredAt)}
                          </p>
                        </div>
                        <Badge
                          variant={bundle.activationRate >= 80 ? "default" : "destructive"}
                          className={cn(
                            bundle.activationRate >= 50 && bundle.activationRate < 80 && "bg-amber-500"
                          )}
                          aria-label={`Activation rate: ${bundle.activationRate.toFixed(1)}%`}
                        >
                          {bundle.activationRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Progress</span>
                          <span>{bundle.claimedItems} / {bundle.totalItems} claimed</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className={cn("h-full rounded-full transition-all", getActivationRateBg(bundle.activationRate))}
                            style={{ width: `${bundle.activationRate}%` }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {data.bundles.length > 6 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    aria-label={showAllBundles ? `Show only top 6 bundles` : `View all ${data.bundles.length} bundles`}
                    onClick={() => setShowAllBundles((v) => !v)}
                  >
                    {showAllBundles ? "Show Less" : `View All ${data.bundles.length} Bundles`}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
                <p className="text-sm">No bundle data available</p>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function BatchActivationMetricsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}