"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Square, Trash2 } from "lucide-react";
import type { User } from "@/db/schema";
import { formatDate } from "@/lib/date";
import { CreateClientModal } from "@/components/admin/create-client-modal";
import { EditClientModal } from "@/components/admin/edit-client-modal";
import { DeleteClientModal } from "@/components/admin/delete-client-modal";
import { BulkDeleteClientsModal } from "@/components/admin/bulk-delete-clients-modal";

interface UserWithTags extends User {
  tagCount: number;
}

interface ClientsTableProps {
  users: UserWithTags[];
}

export function ClientsTable({ users }: ClientsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithTags | null>(null);

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
      setIsAllSelected(false);
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
      setIsAllSelected(true);
    }
  };

  // Handle individual select
  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setIsAllSelected(newSelected.size === filteredUsers.length);
  };

  // Get selected users
  const selectedUsers = users.filter((u) => selectedIds.has(u.id));

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsAllSelected(false);
  };

  return (
    <div>
      {/* Filters */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            aria-label="Cari nama atau email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
          aria-label="Filter role"
          className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Klien
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-800 dark:text-red-300">
              {selectedIds.size} klien dipilih
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Batal pilih
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus {selectedIds.size} Klien
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">
              <button
                onClick={handleSelectAll}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                role="checkbox"
                aria-checked={isAllSelected}
                aria-label={isAllSelected ? "Batalkan pilih semua klien" : "Pilih semua klien"}
              >
                {isAllSelected ? (
                  <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                ) : (
                  <Square className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Klien
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Jumlah Tag
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Terdaftar
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto w-12 h-12 mb-4 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>Tidak ada klien ditemukan</p>
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleSelectOne(user.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    role="checkbox"
                    aria-checked={selectedIds.has(user.id)}
                    aria-label={`Pilih ${user.name || user.email}`}
                  >
                    {selectedIds.has(user.id) ? (
                      <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    ) : (
                      <Square className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || "Tanpa Nama"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Admin
                      </>
                    ) : (
                      "User"
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center text-gray-900 dark:text-white font-medium">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    {user.tagCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" suppressHydrationWarning>
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/admin/client/${user.id}`)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setEditModalOpen(true);
                      }}
                      className="inline-flex items-center p-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                      title="Edit klien"
                      aria-label={`Edit ${user.name || user.email}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center p-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Hapus klien"
                      aria-label={`Hapus ${user.name || user.email}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {/* Modals */}
      <CreateClientModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <EditClientModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
      />
      <DeleteClientModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        user={selectedUser}
      />
      <BulkDeleteClientsModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          setBulkDeleteModalOpen(false);
          clearSelection();
        }}
        selectedUsers={selectedUsers}
      />
    </div>
  );
}
