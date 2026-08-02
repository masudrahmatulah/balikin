"use client";

import { Fragment, useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Copy, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/date";
import { revealStickerPin } from "@/app/admin/sticker-sheets/actions";

interface SheetTag {
  id: string;
  slug: string;
  serialNumber: string | null;
  name: string;
  status: string;
}

interface SheetOwner {
  name: string | null;
  email: string;
}

interface SheetBatch {
  batchNumber: string;
  serialNumberRange: string | null;
}

export interface StickerSheetRow {
  id: string;
  sheetCode: string;
  packageType: string;
  status: string;
  claimedAt: Date | null;
  createdAt: Date | null;
  batch: SheetBatch | null;
  owner: SheetOwner | null;
  tags: SheetTag[];
}

const PACKAGE_LABELS: Record<string, string> = {
  "stiker-pro": "Stiker Balikin Pro",
  "stiker-daily": "Stiker Balikin Daily",
  "stiker-micro": "Stiker Balikin Micro",
  "stiker-family": "Stiker Balikin Family",
};

function packageLabel(packageType: string): string {
  return PACKAGE_LABELS[packageType] || packageType;
}

interface StickerSheetsTableProps {
  sheets: StickerSheetRow[];
}

export function StickerSheetsTable({ sheets }: StickerSheetsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string | null>>({});
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const query = searchQuery.trim().toLowerCase();

  const filteredSheets = sheets.filter((sheet) => {
    const matchesStatus = statusFilter === "all" || sheet.status === statusFilter;
    if (!matchesStatus) return false;
    if (!query) return true;

    const haystack = [
      sheet.sheetCode,
      packageLabel(sheet.packageType),
      sheet.batch?.batchNumber,
      sheet.batch?.serialNumberRange,
      sheet.owner?.name,
      sheet.owner?.email,
      ...sheet.tags.flatMap((t) => [t.slug, t.serialNumber, t.name]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  const handleReveal = (sheetId: string) => {
    setError(null);
    setRevealingId(sheetId);
    startTransition(async () => {
      try {
        const result = await revealStickerPin(sheetId);
        setRevealed((prev) => ({ ...prev, [sheetId]: result.pin }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil PIN");
      } finally {
        setRevealingId(null);
      }
    });
  };

  const handleHide = (sheetId: string) => {
    setRevealed((prev) => {
      const next = { ...prev };
      delete next[sheetId];
      return next;
    });
  };

  const handleCopy = async (sheetId: string, pin: string) => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopiedId(sheetId);
      setTimeout(() => setCopiedId((id) => (id === sheetId ? null : id)), 1500);
    } catch {
      // Clipboard API unavailable - ignore, admin can still read the PIN on screen
    }
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
            placeholder="Cari sheet code, batch, nama/email owner, atau slug stiker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="active">Sudah Diaktivasi</option>
          <option value="inactive">Belum Diaktivasi</option>
        </select>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sheet Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Produk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stiker
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Master PIN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dibuat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSheets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada lembar stiker ditemukan
                </td>
              </tr>
            ) : (
              filteredSheets.map((sheet) => {
                const isExpanded = expandedId === sheet.id;
                const pin = revealed[sheet.id];
                const isRevealing = revealingId === sheet.id && isPending;

                return (
                  <Fragment key={sheet.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : sheet.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={isExpanded ? "Tutup detail stiker" : "Lihat detail stiker"}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{sheet.sheetCode}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {packageLabel(sheet.packageType)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sheet.status === "active"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {sheet.status === "active" ? "Aktif" : "Belum Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {sheet.owner ? (
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{sheet.owner.name || "Tanpa Nama"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{sheet.owner.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Belum diklaim</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{sheet.tags.length}</td>
                      <td className="px-4 py-4">
                        {pin ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{pin}</span>
                            <button
                              onClick={() => handleCopy(sheet.id, pin)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              aria-label="Salin PIN"
                            >
                              {copiedId === sheet.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleHide(sheet.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              aria-label="Sembunyikan PIN"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleReveal(sheet.id)}
                            disabled={isRevealing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isRevealing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                            Tampilkan PIN
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400" suppressHydrationWarning>
                        {formatDateTime(sheet.createdAt)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-4 pb-4 bg-gray-50 dark:bg-gray-900/30">
                          {sheet.batch && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Batch: <span className="font-mono">{sheet.batch.batchNumber}</span>
                              {sheet.batch.serialNumberRange ? ` (${sheet.batch.serialNumberRange})` : ''}
                            </p>
                          )}
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {sheet.tags.map((tag) => (
                              <div
                                key={tag.id}
                                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                              >
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tag.name}</p>
                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">{tag.slug}</p>
                                {tag.serialNumber && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500">SN: {tag.serialNumber}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
