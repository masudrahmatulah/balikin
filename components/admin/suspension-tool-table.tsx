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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Suspension {
  id: string;
  userId: string | null;
  suspensionType: string;
  identifier: string;
  reason: string;
  suspendedAt: Date;
  liftedAt: Date | null;
  isActive: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  suspendedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  liftedByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface SuspensionToolTableProps {
  suspensions: Suspension[];
  adminId: string;
}

export function SuspensionToolTable({ suspensions, adminId }: SuspensionToolTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [newSuspension, setNewSuspension] = useState({
    suspensionType: "user_id" as "user_id" | "device_id",
    identifier: "",
    reason: "",
  });

  const activeSuspensions = suspensions.filter((s) => s.isActive);
  const liftedSuspensions = suspensions.filter((s) => !s.isActive);

  const handleSuspend = async () => {
    if (!newSuspension.identifier || !newSuspension.reason) {
      alert("Please fill in all fields");
      return;
    }

    setUpdating("suspend");
    try {
      const response = await fetch("/admin/api/suspensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSuspension,
          adminId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create suspension");
      }

      setSuspendDialog(false);
      setNewSuspension({ suspensionType: "user_id", identifier: "", reason: "" });
      window.location.reload();
    } catch (error) {
      console.error("Error creating suspension:", error);
      alert("Failed to create suspension. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleLift = async (suspensionId: string) => {
    if (!confirm("Are you sure you want to lift this suspension?")) {
      return;
    }

    const liftReason = prompt("Reason for lifting suspension (optional):");
    if (liftReason === null) return; // Cancelled

    setUpdating(suspensionId);
    try {
      const response = await fetch(`/admin/api/suspensions/${suspensionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, liftReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to lift suspension");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error lifting suspension:", error);
      alert("Failed to lift suspension. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">Active Suspensions</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{activeSuspensions.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">Lifted Suspensions</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{liftedSuspensions.length}</p>
        </div>
      </div>

      {/* Suspend Button */}
      <div className="flex justify-end">
        <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">Suspend User/Device</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User or Device</DialogTitle>
              <DialogDescription>
                Create a new suspension for a user ID or device ID
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Suspension Type</Label>
                <Select
                  value={newSuspension.suspensionType}
                  onValueChange={(value: "user_id" | "device_id") =>
                    setNewSuspension({ ...newSuspension, suspensionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_id">User ID</SelectItem>
                    <SelectItem value="device_id">Device ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {newSuspension.suspensionType === "user_id" ? "User ID" : "Device ID"}
                </Label>
                <Input
                  placeholder={newSuspension.suspensionType === "user_id" ? "Enter user ID" : "Enter device ID"}
                  value={newSuspension.identifier}
                  onChange={(e) =>
                    setNewSuspension({ ...newSuspension, identifier: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Enter reason for suspension..."
                  value={newSuspension.reason}
                  onChange={(e) => setNewSuspension({ ...newSuspension, reason: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSuspend}
                disabled={updating === "suspend"}
                variant="destructive"
                className="w-full"
              >
                {updating === "suspend" ? "Creating..." : "Create Suspension"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Suspensions Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Suspensions</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Suspended By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSuspensions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No active suspensions
                    </TableCell>
                  </TableRow>
                ) : (
                  activeSuspensions.map((suspension) => (
                    <TableRow key={suspension.id}>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          {suspension.suspensionType === "user_id" ? "User ID" : "Device ID"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{suspension.identifier}</TableCell>
                      <TableCell>
                        {suspension.user ? (
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {suspension.user.name || suspension.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{suspension.reason}</TableCell>
                      <TableCell>
                        {suspension.suspendedByUser ? (
                          <p className="text-sm">
                            {suspension.suspendedByUser.name || suspension.suspendedByUser.email}
                          </p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(suspension.suspendedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLift(suspension.id)}
                          disabled={updating === suspension.id}
                        >
                          Lift
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Lifted Suspensions Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lifted Suspensions</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Suspended</TableHead>
                  <TableHead>Lifted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liftedSuspensions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No lifted suspensions
                    </TableCell>
                  </TableRow>
                ) : (
                  liftedSuspensions.map((suspension) => (
                    <TableRow key={suspension.id}>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                          {suspension.suspensionType === "user_id" ? "User ID" : "Device ID"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{suspension.identifier}</TableCell>
                      <TableCell className="max-w-xs truncate">{suspension.reason}</TableCell>
                      <TableCell>
                        {new Date(suspension.suspendedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {suspension.liftedAt ? (
                          <div>
                            {new Date(suspension.liftedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {suspension.liftedByUser && (
                              <p className="text-xs text-gray-500">
                                by {suspension.liftedByUser.name || suspension.liftedByUser.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          "-"
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
    </div>
  );
}
