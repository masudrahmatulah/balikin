"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Square, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/date";
import { BulkDeleteTagsModal } from "@/components/admin/bulk-delete-tags-modal";

interface TagOwner {
  name: string | null;
  email: string;
}

interface TagWithOwner {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string;
  productType: string;
  ownerId: string | null;
  owner: TagOwner | null;
  scanCount: number;
  createdAt: Date;
}

interface TagsTableProps {
  tags: TagWithOwner[];
}

export function TagsTable({ tags }: TagsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "lost">("all");
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.owner?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tag.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
      setIsAllSelected(false);
    } else {
      setSelectedIds(new Set(filteredTags.map((t) => t.id)));
      setIsAllSelected(true);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setIsAllSelected(newSelected.size === filteredTags.length);
  };

  const selectedTags = tags.filter((t) => selectedIds.has(t.id));

  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsAllSelected(false);
  };

  return (
    <div>
      <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, slug, atau owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "normal" | "lost")}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="normal">Normal</option>
          <option value="lost">Hilang</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-800 dark:text-red-300">
              {selectedIds.size} tag dipilih
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
              Hapus {selectedIds.size} Tag
            </button>
          </div>
        </div>
      )}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {isAllSelected ? (
                    <Check className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Scan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dibuat
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTags.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <p>Tidak ada tag ditemukan</p>
                </td>
              </tr>
            ) : (
              filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleSelectOne(tag.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {selectedIds.has(tag.id) ? (
                        <Check className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tag.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {tag.slug}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {tag.tier}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {tag.productType}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tag.status === "lost"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {tag.status === "lost" ? "Hilang" : "Normal"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tag.owner ? (
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {tag.owner.name || "Tanpa Nama"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tag.owner.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Unclaimed</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-gray-900 dark:text-white text-sm">
                      {tag.scanCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" suppressHydrationWarning>
                    {formatDate(tag.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => window.open(`/p/${tag.slug}`, "_blank")}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
        {filteredTags.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            <p>Tidak ada tag ditemukan</p>
          </div>
        ) : (
          filteredTags.map((tag) => (
            <div key={tag.id} className="p-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/30">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleSelectOne(tag.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pt-1"
                  >
                    {selectedIds.has(tag.id) ? (
                      <Check className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">
                      {tag.name}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {tag.slug}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tag.status === "lost"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {tag.status === "lost" ? "Hilang" : "Normal"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tag.scanCount} scan
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                        {formatDate(tag.createdAt)}
                      </span>
                    </div>
                    {tag.owner && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {tag.owner.name || tag.owner.email}
                      </p>
                    )}
                    <div className="mt-3">
                      <button
                        onClick={() => window.open(`/p/${tag.slug}`, "_blank")}
                        className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        Lihat Tag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BulkDeleteTagsModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          setBulkDeleteModalOpen(false);
          clearSelection();
        }}
        selectedTags={selectedTags}
      />
    </div>
  );
}
