"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Check, Package, ArrowRight } from "lucide-react";
import { Link } from "next/link";

interface TagStats {
  total: number;
  claimed: number;
  unclaimed: number;
}

interface Tag {
  id: string;
  slug: string;
  name: string;
  ownerId: string | null;
  status: string;
  createdAt: string;
}

export function RecentTagsSection() {
  const [stats, setStats] = useState<TagStats>({ total: 0, claimed: 0, unclaimed: 0 });
  const [recentTags, setRecentTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/admin/api/vdp/generate?filter=all");
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setStats(data.stats);
      setRecentTags(data.tags.slice(0, 5)); // Show recent 5 tags
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-primary">Recent Activity</h2>
          <p className="font-body text-xs text-secondary mt-1">Overview of tag status</p>
        </div>
        <Link
          href="/admin/vdp-tool/manage"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-neutral/20 text-secondary transition-colors"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-surface border-secondary/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <p className="font-body text-[10px] text-secondary uppercase tracking-widest">Total</p>
                <p className="font-display text-2xl font-bold text-primary mt-0.5">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-secondary/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-body text-[10px] text-secondary uppercase tracking-widest">Claimed</p>
                <p className="font-display text-2xl font-bold text-green-600 mt-0.5">{stats.claimed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-secondary/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600/10 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-body text-[10px] text-secondary uppercase tracking-widest">Unclaimed</p>
                <p className="font-display text-2xl font-bold text-amber-600 mt-0.5">{stats.unclaimed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tags List */}
      <Card className="bg-surface border-secondary/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-bold text-primary">
            Recent Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tertiary"></div>
            </div>
          ) : recentTags.length === 0 ? (
            <div className="py-8 text-center">
              <QrCode className="w-8 h-8 text-secondary/30 mx-auto mb-2" />
              <p className="font-body text-sm text-secondary">No tags yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-sm hover:bg-neutral/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral/20 rounded-sm flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-secondary/50" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-primary">{tag.name}</p>
                      <p className="font-body text-[10px] text-secondary font-mono">
                        /p/{tag.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {tag.ownerId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                        Claimed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">
                        Unclaimed
                      </span>
                    )}
                    <p className="font-body text-[10px] text-secondary">
                      {new Date(tag.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}