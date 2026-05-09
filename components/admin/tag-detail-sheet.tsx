"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scroll, Scan, Calendar, MapPin, Smartphone, Eye, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface ScanLog {
  id: string;
  tagSlug: string;
  ipAddress: string | null;
  location: string | null;
  device: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface Tag {
  id: string;
  slug: string;
  tier: string;
  status: string;
  bundleType: string | null;
  createdAt: Date;
  scanLogs: ScanLog[];
}

interface TagDetailSheetProps {
  tag: Tag;
  trigger?: React.ReactNode;
}

/**
 * Tag Detail Sheet Component
 * Side-drawer for displaying comprehensive tag information
 * Shows scan logs, location data, and device information
 */
export function TagDetailSheet({ tag, trigger }: TagDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<ScanLog | null>(null);

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    unclaimed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  const tierColors = {
    sticker: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    premium: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tag Details: {tag.slug}</SheetTitle>
          <SheetDescription>
            Comprehensive information and scan history
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Tag Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tag Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <Badge className={statusColors[tag.status as keyof typeof statusColors]}>
                  {tag.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tier</span>
                <Badge className={tierColors[tag.tier as keyof typeof tierColors]}>
                  {tag.tier}
                </Badge>
              </div>
              {tag.bundleType && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Module</span>
                  <Badge variant="outline">{tag.bundleType}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(tag.createdAt), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {/* Scan Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Scan Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {tag.scanLogs.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Scans</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {tag.scanLogs.length > 0
                    ? Math.round((tag.scanLogs.length / Math.max(tag.scanLogs.length, 1)) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active Rate</p>
              </div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Scroll className="w-4 h-4" />
              Recent Scans
            </h3>
            {tag.scanLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Scan className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No scans yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tag.scanLogs.slice(0, 10).map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(scan.createdAt), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        {scan.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{scan.location}</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
                {tag.scanLogs.length > 10 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                    + {tag.scanLogs.length - 10} more scans
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Scan Detail View */}
          {selectedScan && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Scan Details
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedScan(null)}
                >
                  Close
                </Button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedScan.createdAt), "PPpp")}
                  </p>
                </div>
                {selectedScan.ipAddress && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">IP Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {selectedScan.ipAddress}
                    </p>
                  </div>
                )}
                {selectedScan.location && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedScan.location}
                    </p>
                  </div>
                )}
                {selectedScan.device && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Device</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedScan.device}
                    </p>
                  </div>
                )}
                {selectedScan.userAgent && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User Agent</p>
                    <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                      {selectedScan.userAgent}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button
            onClick={() => window.open(`/p/${tag.slug}`, "_blank")}
            className="gap-1"
          >
            <Eye className="w-4 h-4" />
            View Public Page
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
