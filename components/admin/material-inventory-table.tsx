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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Material {
  id: string;
  materialType: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastRestockedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MaterialInventoryTableProps {
  materials: Material[];
  adminId: string;
}

export function MaterialInventoryTable({ materials, adminId }: MaterialInventoryTableProps) {
  const [updating, setUpdating] = useState(false);
  const [restockDialog, setRestockDialog] = useState<{ open: boolean; materialId: string }>({
    open: false,
    materialId: "",
  });
  const [restockAmount, setRestockAmount] = useState(0);

  const lowStockItems = materials.filter((m) => m.quantity <= m.lowStockThreshold);

  const handleRestock = async () => {
    if (!restockDialog.materialId || restockAmount <= 0) return;

    setUpdating(true);
    try {
      const response = await fetch(`/admin/api/materials/${restockDialog.materialId}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: restockAmount, adminId }),
      });

      if (!response.ok) {
        throw new Error("Failed to restock");
      }

      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error("Error restocking:", error);
      alert("Failed to restock. Please try again.");
    } finally {
      setUpdating(false);
      setRestockDialog({ open: false, materialId: "" });
      setRestockAmount(0);
    }
  };

  const handleUseMaterial = async (materialId: string, amount: number) => {
    if (amount <= 0) return;

    if (!confirm(`Are you sure you want to use ${amount} ${materials.find((m) => m.id === materialId)?.unit}?`)) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/admin/api/materials/${materialId}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, adminId }),
      });

      if (!response.ok) {
        throw new Error("Failed to use material");
      }

      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error("Error using material:", error);
      alert("Failed to use material. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert for low stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-400">Low Stock Alert</h3>
              <p className="text-sm text-red-700 dark:text-red-500">
                {lowStockItems.length} material(s) are below the threshold. Please restock soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material Type</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No materials found
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => {
                  const isLowStock = material.quantity <= material.lowStockThreshold;
                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium capitalize">
                        {material.materialType === "acrylic" ? "Akrilik" : material.materialType}
                      </TableCell>
                      <TableCell>
                        <span className={cn("text-lg font-semibold", isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white")}>
                          {material.quantity}
                        </span>{" "}
                        <span className="text-sm text-gray-500">{material.unit}</span>
                      </TableCell>
                      <TableCell>{material.lowStockThreshold} {material.unit}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {material.lastRestockedAt ? (
                          new Date(material.lastRestockedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{material.notes || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUseMaterial(material.id, 1)}
                            disabled={updating || material.quantity <= 0}
                          >
                            Use 1
                          </Button>
                          <Dialog
                            open={restockDialog.open && restockDialog.materialId === material.id}
                            onOpenChange={(open) =>
                              setRestockDialog({ open, materialId: open ? material.id : "" })
                            }
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" disabled={updating}>
                                Restock
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restock Material</DialogTitle>
                                <DialogDescription>
                                  Add stock to {material.materialType === "acrylic" ? "Acrylic" : material.materialType}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="amount">Amount to Add ({material.unit})</Label>
                                  <Input
                                    id="amount"
                                    type="number"
                                    min="1"
                                    value={restockAmount || ""}
                                    onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <Button onClick={handleRestock} disabled={updating || restockAmount <= 0} className="w-full">
                                  {updating ? "Processing..." : "Restock"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
