"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [updating, setUpdating] = useState<string | null>(null);

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

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const printingCount = items.filter((i) => i.status === "printing").length;
  const qualityCheckCount = items.filter((i) => i.status === "quality_check").length;
  const readyCount = items.filter((i) => i.status === "ready_for_stock").length;

  return (
    <div className="space-y-6">
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Material Used</TableHead>
                <TableHead>Printed By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No items in print queue
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
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
                    <TableCell>
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
