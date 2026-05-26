"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getLostFoundSuccessRate } from "@/app/admin/actions/overview-actions";
import { RefreshCw, ArrowRight, TrendingUp, Clock, Target, RotateCcw } from "lucide-react";

interface LostFoundMetrics {
  recoveryRate: number;
  totalLostEvents: number;
  recoveredItems: number;
  averageRecoveryHours: number;
  period: string;
}

export function LostFoundSuccessRate() {
  const [metrics, setMetrics] = useState<LostFoundMetrics | null>(null);
  const [period, setPeriod] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await getLostFoundSuccessRate(period);
      setMetrics(data);
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMetrics();
  };

  const getRecoveryRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getRecoveryRateBg = (rate: number) => {
    if (rate >= 80) return "bg-green-600";
    if (rate >= 50) return "bg-amber-600";
    return "bg-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            Lost & Found Success Rate
          </CardTitle>
          <CardDescription className="mt-1">
            Track recovery rate and speed
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
            <SelectTrigger className="w-[100px]" aria-label="Select time period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            aria-label="Refresh metrics"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" aria-live="polite">
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="alert" aria-live="assertive">
            Failed to load metrics
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recovery Rate</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className={cn(
                  "text-5xl font-bold",
                  getRecoveryRateColor(metrics.recoveryRate)
                )} aria-live="polite">
                  {metrics.recoveryRate.toFixed(1)}%
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                <span className="text-xl text-gray-600 dark:text-gray-400">
                  {metrics.recoveredItems}/{metrics.totalLostEvents}
                </span>
              </div>
              <div className="mt-3">
                <Progress value={metrics.recoveryRate} className="h-3" aria-label={`Recovery rate: ${metrics.recoveryRate.toFixed(1)}%`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3" role="list" aria-label="Recovery metrics">
              <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg" role="listitem">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.totalLostEvents}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Lost</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg" role="listitem">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.recoveredItems}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Recovered</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg" role="listitem">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.averageRecoveryHours.toFixed(1)}h
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Recovery</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg" role="listitem">
                <RotateCcw className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {metrics.totalLostEvents - metrics.recoveredItems}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Still Lost</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Recovery Rate Quality
              </p>
              <div className="grid grid-cols-3 gap-2" role="list" aria-label="Quality indicators">
                <div className={cn(
                  "p-3 rounded-lg border text-center",
                  metrics.recoveryRate >= 80
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-40"
                )} role="listitem">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">80%+</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Excellent</p>
                </div>
                <div className={cn(
                  "p-3 rounded-lg border text-center",
                  metrics.recoveryRate >= 50 && metrics.recoveryRate < 80
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                    : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-40"
                )} role="listitem">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">50-80%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Good</p>
                </div>
                <div className={cn(
                  "p-3 rounded-lg border text-center",
                  metrics.recoveryRate < 50
                    ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-40"
                )} role="listitem">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">&lt;50%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Needs Work</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Data from past {metrics.period}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function LostFoundSuccessRateSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}