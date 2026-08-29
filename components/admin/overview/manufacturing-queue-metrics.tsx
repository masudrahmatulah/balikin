"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getManufacturingQueueStats } from "@/app/admin/actions/overview-actions";
import { Package, ArrowRight, Printer, Palette, Gem, Boxes } from "lucide-react";
import { useRouter } from "next/navigation";

interface QueueStats {
  vinyl: number;
  acrylic: number;
  bundles: number;
  total: number;
}

export function ManufacturingQueueMetrics() {
  const router = useRouter();
  const [stats, setStats] = useState<QueueStats>({
    vinyl: 0,
    acrylic: 0,
    bundles: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await getManufacturingQueueStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch queue stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const materialTypes = [
    {
      type: "Stiker Vinyl",
      count: stats.vinyl,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Palette,
    },
    {
      type: "Akrilik Premium",
      count: stats.acrylic,
      color: "bg-green-100 text-green-700 border-green-200",
      icon: Gem,
    },
    {
      type: "Bundling Kits",
      count: stats.bundles,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: Boxes,
    },
  ];

  return (
    <Card className="border-blue-100/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Printer className="h-5 w-5 text-blue-600" />
            Manufacturing Queue
          </CardTitle>
          <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">
            Ready to Print orders by material type
          </CardDescription>
        </div>
        <Badge variant={stats.total > 0 ? "default" : "secondary"} className="gap-1">
          <Package className="w-3 h-3" />
          {stats.total} items
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {materialTypes.map((material) => (
              <div
                key={material.type}
                className={`flex items-center justify-between p-3 rounded-lg border ${material.color}`}
              >
                <div className="flex items-center gap-3">
                  <material.icon className="w-5 h-5" strokeWidth={2} />
                  <div>
                    <p className="font-semibold text-sm">{material.type}</p>
                    <p className="text-xs opacity-75">Ready for Production</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{material.count}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                    onClick={() => router.push("/admin/print-queue")}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

          <Button
          variant="outline"
          className="mt-4 w-full gap-2 border-blue-100 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800"
          onClick={() => router.push("/admin/print-queue")}
        >
          <Printer className="w-4 h-4" />
          View Print Queue
        </Button>
      </CardContent>
    </Card>
  );
}

export function ManufacturingQueueMetricsSkeleton() {
  return (
    <Card className="border-blue-100/80 bg-white/90 dark:border-slate-700 dark:bg-slate-900/90">
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
