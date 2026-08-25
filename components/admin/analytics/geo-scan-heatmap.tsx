"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getGeoScanData } from "@/app/admin/actions/overview-actions";
import { MapPin, RefreshCw, TrendingUp, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

interface GeoScanData {
  period: string;
  totalScans: number;
  topCities: Array<{ city: string | null; count: number }>;
  allCities: Array<{ city: string | null; count: number }>;
}

export function GeoScanHeatmap() {
  const [data, setData] = useState<GeoScanData | null>(null);
  const [period, setPeriod] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const result = await getGeoScanData(period);
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
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const chartData = data?.topCities
    .filter(c => c.city !== null)
    .map(c => ({
      city: c.city?.replace(/City|Kota/gi, "").trim() || "Unknown",
      count: c.count,
    }))
    .slice(0, 8) || [];

  const totalScans = data?.totalScans || 0;
  const topCity = chartData[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" aria-hidden="true" />
            Geospatial Scan Distribution
          </CardTitle>
          <CardDescription className="mt-1">
            Scan concentration by location
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
            <SelectTrigger className="w-[100px]" aria-label="Select time period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            aria-label="Refresh geo data"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" aria-live="polite">
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="alert" aria-live="assertive">
            Failed to load geo data
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3" role="list" aria-label="Geo scan statistics">
              <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg" role="listitem">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {totalScans.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Scans</p>
              </div>

              <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg" role="listitem">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.topCities.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active Cities</p>
              </div>

              <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg" role="listitem">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate w-full text-center px-1" aria-live="polite">
                  {topCity?.city || "N/A"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Top City</p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div aria-label={`Bar chart showing scan distribution by city for past ${data.period} days`}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="city"
                      className="text-xs"
                      tick={{ fill: "currentColor" }}
                      tickLine={false}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "currentColor" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.98)",
                        border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                        borderRadius: "8px",
                        padding: "12px",
                      }}
                      labelStyle={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                      itemStyle={{ color: isDark ? "#cbd5e1" : "#334155" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No scan data available for this period</p>
              </div>
            )}

            {data.topCities.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Top Scan Locations
                </p>
                <div className="space-y-1" role="list" aria-label="Top scan locations list">
                  {data.topCities.slice(0, 5).map((city, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                      role="listitem"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          aria-hidden="true"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {city.city || "Unknown"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {city.count.toLocaleString()}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({totalScans > 0 ? ((city.count / totalScans) * 100).toFixed(1) : 0}%)
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Data from past {data.period}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function GeoScanHeatmapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}