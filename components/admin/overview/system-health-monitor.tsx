"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSystemHealthStats } from "@/app/admin/actions/overview-actions";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RotateCw, MessageSquare } from "lucide-react";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

interface SystemHealthData {
  systemStatus: 'online' | 'degraded' | 'offline';
  successRate: number;
  totalNotifications: number;
  successfulNotifications: number;
  failedNotifications: number;
}

export function SystemHealthMonitor() {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const data = await getSystemHealthStats();
      setHealth(data);
    } catch (error) {
      console.error("Failed to fetch system health:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { isRefreshing, refresh } = useAutoRefresh({
    interval: 60000, // 60 seconds
    enabled: true,
    onRefresh: fetchHealth,
    immediate: false,
  });

  useEffect(() => {
    fetchHealth();
  }, []);

  const getStatusConfig = (status: SystemHealthData['systemStatus']) => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          label: 'Online',
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          bg: 'bg-amber-100 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          label: 'Degraded',
        };
      case 'offline':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          label: 'Offline',
        };
    }
  };

  const StatusIcon = health ? getStatusConfig(health.systemStatus).icon : Activity;

  return (
    <Card className="border-blue-100/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Activity className="h-5 w-5 text-blue-600" />
            System Health
          </CardTitle>
          <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">
            WhatsApp API & notification system status
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          className="gap-1"
        >
          <RotateCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        ) : health ? (
          <div className="space-y-4">
            {/* System Status */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-lg border",
              getStatusConfig(health.systemStatus).bg,
              getStatusConfig(health.systemStatus).border
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  getStatusConfig(health.systemStatus).bg
                )}>
                  <StatusIcon className={cn(
                    "w-5 h-5",
                    getStatusConfig(health.systemStatus).color
                  )} />
                </div>
                <div>
                  <p className="font-semibold text-sm">System Status</p>
                  <p className={cn(
                    "text-xs",
                    getStatusConfig(health.systemStatus).color
                  )}>
                    {getStatusConfig(health.systemStatus).label}
                  </p>
                </div>
              </div>
              <Badge variant={health.systemStatus === 'online' ? 'default' : 'destructive'}>
                {health.systemStatus === 'online' ? 'Operational' : 'Issue Detected'}
              </Badge>
            </div>

            {/* Notification Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {health.totalNotifications}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {health.successfulNotifications}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Success</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {health.failedNotifications}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Failed</p>
              </div>
            </div>

            {/* Success Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Success Rate (24h)</span>
                <span className="font-semibold">{health.successRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    health.successRate >= 90 ? "bg-green-600" :
                    health.successRate >= 70 ? "bg-amber-600" :
                    "bg-red-600"
                  )}
                  style={{ width: `${health.successRate}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Failed to load health data
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SystemHealthMonitorSkeleton() {
  return (
    <Card className="border-blue-100/80 bg-white/90 dark:border-slate-700 dark:bg-slate-900/90">
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
