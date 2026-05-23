"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download, Filter, Search, Package, RotateCw, Clock, X, CheckSquare2, Square } from "lucide-react";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

interface PrintQueueItem {
  id: string;
  batchId: string;
  batchName: string;
  status: string;
  itemCount: number;
  materialType: string;
  materialUsed: string | null;
  printedBy: string | null;
  printedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  printedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface PrintQueueTableProps {
  items: PrintQueueItem[];
  adminId: string;
}

export function PrintQueueTable({ items, adminId }: PrintQueueTableProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentItems, setCurrentItems] = useState(items);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Auto-refresh every 60 seconds
  const { isRefreshing, nextRefreshIn, refresh } = useAutoRefresh({
    interval: 60000, // 60 seconds
    enabled: true,
    onRefresh: async () => {
      // Refresh the page to get latest data
      router.refresh();
    },
    immediate: false, // Don't refresh immediately on mount
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    printing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    quality_check: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    ready_for_stock: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };

  const statusLabels = {
    pending: "Pending",
    printing: "Printing",
    quality_check: "Quality Check",
    ready_for_stock: "Ready for Stock",
    completed: "Completed",
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const printingCount = items.filter((i) => i.status === "printing").length;
  const qualityCheckCount = items.filter((i) => i.status === "quality_check").length;
  const readyCount = items.filter((i) => i.status === "ready_for_stock").length;

  // Update current items when props change
  useEffect(() => {
    setCurrentItems(items);
  }, [items]);

  // Filter items based on status and search query
  const filteredItems = currentItems.filter((item) => {
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      item.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const allSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id));
  const someSelected = selectedIds.size > 0;

  const updateStatus = async (itemId: string, newStatus: string) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`/admin/api/print-queue/${itemId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state and refresh the page
      setCurrentItems(currentItems.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      ));

      // Small delay then refresh page to get server-side updates
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    setBulkUpdating(true);
    try {
      const response = await fetch("/admin/api/print-queue/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status: newStatus, adminId }),
      });

      if (!response.ok) {
        throw new Error("Failed to bulk update status");
      }

      // Clear selection and refresh page
      setSelectedIds(new Set());
      window.location.reload();
    } catch (error) {
      console.error("Error bulk updating status:", error);
      alert("Failed to bulk update status. Please try again.");
    } finally {
      setBulkUpdating(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredItems.map(item => item.id);
    const allSelected = visibleIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(visibleIds));
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <div className="space-y-6">
      {/* Auto-Refresh Indicator */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {isRefreshing ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Memperbarui data...</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span>
                Terakhir diperbarui: {new Date().toLocaleTimeString("id-ID")}
                {nextRefreshIn !== null && ` • Next refresh in ${nextRefreshIn}s`}
              </span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          className="gap-1"
        >
          <RotateCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh Now
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Printing</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{printingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Quality Check</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{qualityCheckCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ready for Stock</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{readyCount}</p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-300">
            <CheckSquare2 className="w-5 h-5" />
            <span>{selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Set status:</span>
            <Select
              onValueChange={bulkUpdateStatus}
              disabled={bulkUpdating}
              value=""
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="printing">Printing</SelectItem>
                <SelectItem value="quality_check">Quality Check</SelectItem>
                <SelectItem value="ready_for_stock">Ready for Stock</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={bulkUpdating}
              className="gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by batch name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="printing">Printing</SelectItem>
              <SelectItem value="quality_check">Quality Check</SelectItem>
              <SelectItem value="ready_for_stock">Ready for Stock</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Download All Button */}
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            filteredItems.forEach((item, index) => {
              setTimeout(() => {
                window.open(`/admin/api/print-queue/${item.id}/download`, "_blank");
              }, index * 300);
            });
          }}
          disabled={filteredItems.length === 0}
        >
          <Download className="w-4 h-4" />
          Download Assets ({filteredItems.length})
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Results counter */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4" />
            <span>
              Showing {filteredItems.length} of {items.length} items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Batch Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Material Used</TableHead>
                <TableHead>Printed By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {items.length === 0 ? "No items in print queue" : "No items match your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelection(item.id)}
                        aria-label={`Select ${item.batchName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-gray-900 dark:text-white">{item.batchName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.batchId.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                        {statusLabels[item.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.itemCount}</TableCell>
                    <TableCell className="capitalize">{item.materialType}</TableCell>
                    <TableCell>{item.materialUsed || "-"}</TableCell>
                    <TableCell>
                      {item.printedByUser ? (
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {item.printedByUser.name || item.printedByUser.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/admin/api/print-queue/${item.id}/download`, "_blank")}
                          className="gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                        <Select
                          value={item.status}
                          onValueChange={(value) => updateStatus(item.id, value)}
                          disabled={updating === item.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="printing">Printing</SelectItem>
                            <SelectItem value="quality_check">Quality Check</SelectItem>
                            <SelectItem value="ready_for_stock">Ready for Stock</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
