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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  recipientName: string;
  phone: string;
  city: string;
  totalAmount: number;
  createdAt: Date;
  shippingTracking?: {
    id: string;
    courier: string;
    trackingNumber: string;
    status: string;
    shippedAt: Date | null;
  } | null;
}

interface ShippingTableProps {
  orders: Order[];
  adminId: string;
}

export function ShippingTable({ orders, adminId }: ShippingTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [manualUpdate, setManualUpdate] = useState<{
    orderId: string;
    courier: string;
    trackingNumber: string;
  }>({ orderId: "", courier: "", trackingNumber: "" });
  const [bulkCsv, setBulkCsv] = useState("");

  const shippedCount = orders.filter((o) => o.shippingTracking?.shippedAt).length;
  const pendingCount = orders.length - shippedCount;

  const handleManualUpdate = async () => {
    if (!manualUpdate.orderId || !manualUpdate.courier || !manualUpdate.trackingNumber) {
      alert("Please fill in all fields");
      return;
    }

    setUpdating(manualUpdate.orderId);
    try {
      const response = await fetch("/admin/api/shipping/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualUpdate,
          adminId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tracking");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating tracking:", error);
      alert("Failed to update tracking. Please try again.");
    } finally {
      setUpdating(null);
      setManualUpdate({ orderId: "", courier: "", trackingNumber: "" });
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkCsv.trim()) {
      alert("Please enter CSV data");
      return;
    }

    setUpdating("bulk");
    try {
      // Parse CSV (format: orderId,courier,trackingNumber)
      const lines = bulkCsv.trim().split("\n");
      const updates = lines.map((line) => {
        const [orderId, courier, trackingNumber] = line.split(",").map((s) => s.trim());
        return { orderId, courier, trackingNumber };
      });

      const response = await fetch("/admin/api/shipping/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, adminId }),
      });

      if (!response.ok) {
        throw new Error("Failed to bulk update");
      }

      const result = await response.json();
      alert(`Successfully updated ${result.successCount} orders`);
      window.location.reload();
    } catch (error) {
      console.error("Error bulk updating:", error);
      alert("Failed to bulk update. Please check the CSV format.");
    } finally {
      setUpdating(null);
      setBulkDialog(false);
      setBulkCsv("");
    }
  };

  const courierOptions = [
    { value: "jne", label: "JNE" },
    { value: "sicepat", label: "Sicepat" },
    { value: "jnt", label: "J&T" },
    { value: "pos", label: "POS Indonesia" },
    { value: "anteraja", label: "AnterAja" },
    { value: "gojek", label: "GoSend" },
    { value: "grab", label: "GrabExpress" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Shipment</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Shipped</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{shippedCount}</p>
        </div>
      </div>

      {/* Bulk Upload Button */}
      <div className="flex justify-end">
        <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
          <DialogTrigger asChild>
            <Button>Bulk Update (CSV)</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Update Tracking Numbers</DialogTitle>
              <DialogDescription>
                Upload multiple tracking numbers at once using CSV format
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>CSV Format</Label>
                <p className="text-sm text-gray-500">orderId,courier,trackingNumber (one per line)</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                  order-123,jne,JX1234567890<br />
                  order-456,sicepat,SC0098765432
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv">CSV Data</Label>
                <textarea
                  id="csv"
                  className="w-full min-h-[200px] p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="order-123,jne,JX1234567890&#10;order-456,sicepat,SC0098765432"
                  value={bulkCsv}
                  onChange={(e) => setBulkCsv(e.target.value)}
                />
              </div>
              <Button onClick={handleBulkUpdate} disabled={updating === "bulk"} className="w-full">
                {updating === "bulk" ? "Processing..." : "Update All"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Shipping Status</TableHead>
                <TableHead>Tracking Info</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No paid orders ready for shipping
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.recipientName}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.city}</TableCell>
                    <TableCell>
                      {order.shippingTracking?.shippedAt ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Shipped
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.shippingTracking ? (
                        <div>
                          <p className="text-sm font-medium capitalize">{order.shippingTracking.courier}</p>
                          <p className="text-xs text-gray-500">{order.shippingTracking.trackingNumber}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!order.shippingTracking?.shippedAt && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setManualUpdate({ orderId: order.id, courier: "", trackingNumber: "" })
                              }
                            >
                              Add Tracking
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Tracking Number</DialogTitle>
                              <DialogDescription>
                                Update shipping information for order {order.id.slice(0, 8)}...
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Courier</Label>
                                <Select
                                  value={manualUpdate.orderId === order.id ? manualUpdate.courier : ""}
                                  onValueChange={(value) =>
                                    setManualUpdate({ ...manualUpdate, courier: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select courier" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {courierOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Tracking Number</Label>
                                <Input
                                  placeholder="Enter tracking number"
                                  value={manualUpdate.orderId === order.id ? manualUpdate.trackingNumber : ""}
                                  onChange={(e) =>
                                    setManualUpdate({ ...manualUpdate, trackingNumber: e.target.value })
                                  }
                                />
                              </div>
                              <Button
                                onClick={handleManualUpdate}
                                disabled={updating === order.id}
                                className="w-full"
                              >
                                {updating === order.id ? "Updating..." : "Update Tracking"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
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
