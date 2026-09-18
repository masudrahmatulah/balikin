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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface TierManagementTableProps {
  users: User[];
  adminId: string;
}

export function TierManagementTable({ users, adminId }: TierManagementTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    if (filter === "free") return user.role === "user";
    if (filter === "premium") return user.role === "premium";
    return true;
  });

  const selectedUsers = filteredUsers.filter((user) => selectedUserIds.includes(user.id));
  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selectedUserIds.includes(user.id));

  const toggleUser = (userId: string, checked: boolean) => {
    setSelectedUserIds((current) =>
      checked ? [...new Set([...current, userId])] : current.filter((id) => id !== userId)
    );
  };

  const toggleAllFiltered = (checked: boolean) => {
    setSelectedUserIds((current) => {
      if (checked) return [...new Set([...current, ...filteredUsers.map((user) => user.id)])];
      const filteredIds = new Set(filteredUsers.map((user) => user.id));
      return current.filter((id) => !filteredIds.has(id));
    });
  };

  const upgradeTier = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch("/admin/api/tiers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole, adminId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tier");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating tier:", error);
      alert("Failed to update tier. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkUpgrade = async () => {
    if (selectedUsers.length === 0) {
      alert("Pilih minimal satu user");
      return;
    }

    setUpdating("bulk");
    try {
      const emails = selectedUsers.map((user) => user.email);

      const response = await fetch("/admin/api/tiers/bulk-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, newRole: "premium", adminId }),
      });

      if (!response.ok) {
        throw new Error("Failed to bulk upgrade");
      }

      const result = await response.json();
      alert(`Successfully upgraded ${result.successCount} users`);
      window.location.reload();
    } catch (error) {
      console.error("Error bulk upgrading:", error);
      alert("Failed to bulk upgrade. Please try again.");
    } finally {
      setUpdating(null);
      setBulkDialog(false);
      setSelectedUserIds([]);
    }
  };

  const premiumCount = users.filter((u) => u.role === "premium").length;
  const freeCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Premium Users</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{premiumCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Free Users</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{freeCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "free" ? "default" : "outline"}
            onClick={() => setFilter("free")}
          >
            Free
          </Button>
          <Button
            variant={filter === "premium" ? "default" : "outline"}
            onClick={() => setFilter("premium")}
          >
            Premium
          </Button>
        </div>

        <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
          <DialogTrigger asChild>
            <Button disabled={selectedUsers.length === 0}>
              Bulk Upgrade{selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ""}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upgrade to Premium</DialogTitle>
              <DialogDescription>
                Upgrade user yang dicentang ke Premium tier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3 dark:border-gray-700">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={true} disabled />
                    <span className="truncate">{user.name || "Tanpa nama"} ({user.email})</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleBulkUpgrade} disabled={updating === "bulk"} className="w-full">
                {updating === "bulk" ? "Processing..." : "Upgrade All to Premium"}
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={(checked) => toggleAllFiltered(checked === true)}
                    aria-label="Pilih semua user yang tampil"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Tier</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={(checked) => toggleUser(user.id, checked === true)}
                        aria-label={`Pilih ${user.name || user.email}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.name || <span className="text-gray-400">No name</span>}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === "premium" ? (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                          Free
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => upgradeTier(user.id, value)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Free</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
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
