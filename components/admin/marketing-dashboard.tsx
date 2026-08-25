"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, ShoppingCart, Activity, Target, Award } from "lucide-react";

interface AnalyticsData {
  conversionFunnel: {
    stage: string;
    count: number;
    conversionRate: number;
  }[];
  modulePerformance: {
    module: string;
    activations: number;
    users: number;
    revenue: number;
  }[];
  finderToBuyer: {
    period: string;
    finders: number;
    signups: number;
    conversionRate: number;
  }[];
  timeSeriesData: {
    date: string;
    newUsers: number;
    conversions: number;
    revenue: number;
  }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function MarketingDashboard({ embedded = false }: { embedded?: boolean }) {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/admin/marketing/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <span className="sr-only">Loading analytics data</span>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-hidden="true" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400" role="alert" aria-live="assertive">
          Failed to load analytics data
        </CardContent>
      </Card>
    );
  }

  const funnelCard = (
          <Card>
            <CardHeader>
              <CardTitle>Free-to-Premium Conversion Funnel</CardTitle>
              <CardDescription>
                Track how users move from free tier to premium purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div aria-label={`Bar chart showing conversion funnel with ${data.conversionFunnel.length} stages`}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.conversionFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
  );

  const modulesCards = (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Module Performance Analytics
                </CardTitle>
                <CardDescription>
                  Track activation rates and revenue by module type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div aria-label={`Bar chart showing module performance with ${data.modulePerformance.length} modules`}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.modulePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="module" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activations" fill="#10b981" name="Activations" />
                      <Bar dataKey="users" fill="#3b82f6" name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module Revenue Distribution</CardTitle>
                <CardDescription>Revenue breakdown by module type</CardDescription>
              </CardHeader>
              <CardContent>
                <div aria-label={`Pie chart showing revenue distribution by module`}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.modulePerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.module}: Rp${entry.revenue.toLocaleString()}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {data.modulePerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
  );

  const finderCards = (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Finder-to-Buyer Conversion
                </CardTitle>
                <CardDescription>
                  Track how many finders become paying customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div aria-label={`Line chart showing finder to buyer conversion over ${data.finderToBuyer.length} periods`}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.finderToBuyer}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="finders" stroke="#3b82f6" strokeWidth={2} name="Finders" />
                      <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} name="Signups" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Over Time</CardTitle>
                <CardDescription>Finder-to-buyer conversion rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div aria-label="Line chart showing conversion rate percentage over time">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.finderToBuyer}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="conversionRate"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Conversion Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
  );

  const trendsCard = (
          <Card>
            <CardHeader>
              <CardTitle>User Growth & Revenue Trends</CardTitle>
              <CardDescription>Track new users and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div aria-label={`Line chart showing user growth and revenue trends over ${data.timeSeriesData.length} data points`}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="New Users"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="conversions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Conversions"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
  );

  if (embedded) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Select value={timeRange} onValueChange={(value: "daily" | "weekly" | "monthly") => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]" aria-label="Select time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="list" aria-label="Key metrics">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.conversionFunnel[0]?.count || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" aria-hidden="true" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.conversionFunnel[data.conversionFunnel.length - 1]?.count || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" aria-hidden="true" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                  {data.conversionFunnel[data.conversionFunnel.length - 1]?.conversionRate.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" aria-hidden="true" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                  Rp {(data.modulePerformance.reduce((sum, m) => sum + m.revenue, 0)).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {funnelCard}
          {modulesCards}
          {finderCards}
          {trendsCard}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(value: "daily" | "weekly" | "monthly") => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]" aria-label="Select time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="list" aria-label="Key metrics">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                {data.conversionFunnel[0]?.count || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                {data.conversionFunnel[data.conversionFunnel.length - 1]?.count || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                {data.conversionFunnel[data.conversionFunnel.length - 1]?.conversionRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
                Rp {(data.modulePerformance.reduce((sum, m) => sum + m.revenue, 0)).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conversion" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto py-1" role="tablist" aria-label="Analytics tabs">
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="modules">Module Performance</TabsTrigger>
          <TabsTrigger value="finder">Finder to Buyer</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="conversion" className="space-y-6" role="tabpanel">
          {funnelCard}
        </TabsContent>

        <TabsContent value="modules" className="space-y-6" role="tabpanel">
          {modulesCards}
        </TabsContent>

        <TabsContent value="finder" className="space-y-6" role="tabpanel">
          {finderCards}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6" role="tabpanel">
          {trendsCard}
        </TabsContent>
      </Tabs>
    </div>
  );
}