"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

interface Tag {
  id: string;
  slug: string;
  name: string;
  ownerId: string | null;
  contactWhatsapp: string | null;
  customMessage: string | null;
  rewardNote: string | null;
  status: string;
  tier: string;
  productType: string;
  createdAt: string;
}

interface QRStokStats {
  total: number;
  claimed: number;
  unclaimed: number;
}

export function QRStokManager() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<QRStokStats>({ total: 0, claimed: 0, unclaimed: 0 });
  const [filter, setFilter] = useState<"all" | "claimed" | "unclaimed">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [tagName, setTagName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [rewardNote, setRewardNote] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Preview modal state
  const [previewTag, setPreviewTag] = useState<Tag | null>(null);
  const [previewQrData, setPreviewQrData] = useState<string | null>(null);

  // Bulk generate state
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [bulkQuantity, setBulkQuantity] = useState("10");
  const [bulkStartNumber, setBulkStartNumber] = useState("1");
  const [bulkCustomMessage, setBulkCustomMessage] = useState("");
  const [bulkRewardNote, setBulkRewardNote] = useState("");
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<Tag[]>([]);
  const [showBulkResults, setShowBulkResults] = useState(false);

  // Selection state
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printPreviewQrCodes, setPrintPreviewQrCodes] = useState<Array<{
    tag: Tag;
    qrDataUrl: string;
  }>>([]);
  const [isGeneratingPrintPreview, setIsGeneratingPrintPreview] = useState(false);

  // Fetch tags on mount and filter change
  useEffect(() => {
    fetchTags();
  }, [filter]);

  // Toggle print mode class on body
  useEffect(() => {
    if (showPrintPreview) {
      document.body.classList.add('printing-mode');
    } else {
      document.body.classList.remove('printing-mode');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('printing-mode');
    };
  }, [showPrintPreview]);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/qr-stok");
      if (!response.ok) throw new Error("Failed to fetch tags");

      const data = await response.json();
      let filteredTags = data.tags;

      // Filter by status
      if (filter === "claimed") {
        filteredTags = filteredTags.filter((tag: Tag) => tag.ownerId !== null);
      } else if (filter === "unclaimed") {
        filteredTags = filteredTags.filter((tag: Tag) => tag.ownerId === null);
      }

      setTags(filteredTags);

      // Calculate stats
      const total = data.tags.length;
      const claimed = data.tags.filter((t: Tag) => t.ownerId !== null).length;
      const unclaimed = total - claimed;

      setStats({ total, claimed, unclaimed });
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR preview when tag name changes
  useEffect(() => {
    if (tagName) {
      const slug = tagName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      generateQRPreview(slug);
    } else {
      setQrPreview(null);
    }
  }, [tagName]);

  const generateQRPreview = async (slug: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const qrUrl = `${baseUrl}/p/${slug}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrPreview(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR preview:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName) return;

    setIsSubmitting(true);

    try {
      // Generate slug from tag name
      const slug = tagName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + nanoid(6);

      const response = await fetch("/api/admin/qr-stok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tagName,
          slug,
          contactWhatsapp,
          customMessage,
          rewardNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to create QR stok");

      // Reset form
      setTagName("");
      setContactWhatsapp("");
      setCustomMessage("");
      setRewardNote("");
      setQrPreview(null);
      setShowCreateForm(false);

      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error("Error creating QR stok:", error);
      alert("Gagal membuat QR stok. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus QR stok ini?")) return;

    try {
      const response = await fetch(`/api/admin/qr-stok?tagId=${tagId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete tag");

      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert("Gagal menghapus QR stok. Silakan coba lagi.");
    }
  };

  const downloadQR = async (slug: string, tagName: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const qrUrl = `${baseUrl}/p/${slug}`;

      // Generate high-res QR code for printing
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 600,
        margin: 4,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Create download link
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `qr-${slug}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading QR:", error);
      alert("Gagal mengunduh QR code. Silakan coba lagi.");
    }
  };

  // Preview modal functions
  const openPreview = async (tag: Tag) => {
    setPreviewTag(tag);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const qrUrl = `${baseUrl}/p/${tag.slug}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 3,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setPreviewQrData(qrDataUrl);
    } catch (error) {
      console.error("Error generating preview QR:", error);
    }
  };

  const closePreview = () => {
    setPreviewTag(null);
    setPreviewQrData(null);
  };

  // Bulk generate functions
  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(bulkQuantity);
    const startNumber = parseInt(bulkStartNumber);

    if (!bulkPrefix || quantity < 1 || quantity > 100) {
      alert("Masukkan prefix yang valid dan quantity antara 1-100");
      return;
    }

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: quantity });
    setBulkResults([]);

    try {
      const createdTags: Tag[] = [];

      for (let i = 0; i < quantity; i++) {
        const number = startNumber + i;
        const name = `${bulkPrefix} ${number}`;
        const slugPrefix = bulkPrefix.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const slug = `${slugPrefix}-${number}-${nanoid(4)}`;

        const response = await fetch("/api/admin/qr-stok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            contactWhatsapp: null,
            customMessage: bulkCustomMessage || null,
            rewardNote: bulkRewardNote || null,
          }),
        });

        if (!response.ok) throw new Error(`Failed to create tag ${i + 1}`);

        const data = await response.json();
        createdTags.push(data.tag);
        setBulkProgress({ current: i + 1, total: quantity });
      }

      setBulkResults(createdTags);
      setShowBulkResults(true);
      setShowBulkForm(false);

      // Reset form
      setBulkPrefix("");
      setBulkQuantity("10");
      setBulkStartNumber("1");
      setBulkCustomMessage("");
      setBulkRewardNote("");

      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error("Error bulk generating:", error);
      alert("Gagal generate QR stok. Silakan coba lagi.");
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const printBulkResults = () => {
    window.print();
  };

  // Selection helper functions
  const toggleTagSelection = (tagId: string) => {
    const newSelected = new Set(selectedTagIds);
    if (newSelected.has(tagId)) {
      newSelected.delete(tagId);
    } else {
      newSelected.add(tagId);
    }
    setSelectedTagIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTagIds(new Set(tags.map(t => t.id)));
    } else {
      setSelectedTagIds(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedTagIds(new Set());
  };

  const isAllSelected = tags.length > 0 && selectedTagIds.size === tags.length;
  const isSomeSelected = selectedTagIds.size > 0 && !isAllSelected;

  const handlePrintSelected = async () => {
    if (selectedTagIds.size === 0) {
      alert("Pilih minimal 1 QR code untuk print.");
      return;
    }

    setIsGeneratingPrintPreview(true);
    const selectedTags = tags.filter(t => selectedTagIds.has(t.id));

    try {
      // Navigate to layout editor page with selected tag IDs
      const tagIds = selectedTags.map(t => t.id).join(',');
      router.push(`/admin/qr-stok/layout?tags=${tagIds}`);
    } catch (error) {
      console.error("Error navigating to layout editor:", error);
      alert("Gagal membuka layout editor. Silakan coba lagi.");
    } finally {
      setIsGeneratingPrintPreview(false);
    }
  };

  const executePrint = () => {
    window.print();
  };

  const handleDownloadSelected = async () => {
    const selectedTags = tags.filter(t => selectedTagIds.has(t.id));

    for (const tag of selectedTags) {
      await downloadQR(tag.slug, tag.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total QR Stok</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M9 17h.01M9 17v-3m0 0h.01M18 17v-3m0 0h.01M16 17h.01M20 17h.01M20 9h.01M18 9h.01M16 9h.01M14 9h.01M12 9h.01M10 9h.01M8 9h.01M6 9h.01M4 9h.01M4 11h.01M4 13h.01M4 15h.01M4 17h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sudah Diclaim</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.claimed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Belum Diclaim</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.unclaimed}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Create & Bulk Generate Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={() => {
            setShowBulkResults(false);
            setShowBulkForm(!showBulkForm);
            setShowCreateForm(false);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all"
        >
          {showBulkForm ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Tutup Bulk Form
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Bulk Generate
            </>
          )}
        </button>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowBulkForm(false);
            setShowBulkResults(false);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          {showCreateForm ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Tutup Form
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat QR Stok Baru
            </>
          )}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Generate QR Stok Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                {/* Tag Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nama Tag / Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gantungan Kunci Akrilik 001"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* WhatsApp Contact */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nomor WhatsApp (Opsional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 628123456789"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Nomor WhatsApp pemilik (akan diisi otomatis saat QR diclaim)
                  </p>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pesan Khusus (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Ini adalah barang kesayangan saya, tolong dikembalikan ya..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Reward Note */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Catatan Imbalan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Akan memberi imbalan bensin 20k"
                    value={rewardNote}
                    onChange={(e) => setRewardNote(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setTagName("");
                      setContactWhatsapp("");
                      setCustomMessage("");
                      setRewardNote("");
                      setQrPreview(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !tagName}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? "Memproses..." : "Generate QR"}
                  </button>
                </div>
              </div>

              {/* Right Column - QR Preview */}
              <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                {qrPreview ? (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <img src={qrPreview} alt="QR Code Preview" className="w-48 h-48" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                      Preview QR Code untuk: <br />
                      <span className="font-medium text-slate-900 dark:text-white">{tagName}</span>
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-48 h-48 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M9 17h.01M9 17v-3m0 0h.01M18 17v-3m0 0h.01M16 17h.01M20 17h.01M20 9h.01M18 9h.01M16 9h.01M14 9h.01M12 9h.01M10 9h.01M8 9h.01M6 9h.01M4 9h.01M4 11h.01M4 13h.01M4 15h.01M4 17h.01" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Masukkan nama tag untuk melihat preview QR code
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("claimed")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "claimed"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Sudah Diclaim
        </button>
        <button
          onClick={() => setFilter("unclaimed")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "unclaimed"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Belum Diclaim
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTagIds.size > 0 && (
        <div className="sticky top-0 z-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  {selectedTagIds.size} QR Terpilih
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Pilih aksi untuk QR yang dipilih
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintSelected}
                disabled={isGeneratingPrintPreview}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isGeneratingPrintPreview ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSelected}
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>

              <button
                onClick={clearSelection}
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-300 dark:border-slate-600 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : tags.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Belum ada QR stok
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {filter === "unclaimed" ? "Tidak ada QR stok yang belum diclaim." : "Mulai dengan membuat QR stok baru."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (isSomeSelected && input) {
                          input.indeterminate = true;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Nama Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                      selectedTagIds.has(tag.id)
                        ? "bg-blue-50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTagIds.has(tag.id)}
                        onChange={() => toggleTagSelection(tag.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {tag.name}
                        </div>
                      </div>
                      {tag.contactWhatsapp && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {tag.contactWhatsapp}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {tag.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tag.ownerId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                          Sudah Diclaim
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">
                          Belum Diclaim
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(tag.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openPreview(tag)}
                        className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                        title="Preview QR"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => downloadQR(tag.slug, tag.name)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Download QR"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      {!tag.ownerId && (
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Hapus"
                        >
                          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Generate Form */}
      {showBulkForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Bulk Generate QR Stok
          </h2>

          <form onSubmit={handleBulkGenerate} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                {/* Prefix */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Prefix Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gantungan Akrilik"
                    value={bulkPrefix}
                    onChange={(e) => setBulkPrefix(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Nama tag akan menjadi: "{bulkPrefix || 'Prefix'} 1", "{bulkPrefix || 'Prefix'} 2", dst.
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={bulkQuantity}
                    onChange={(e) => setBulkQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Maksimal 100 QR per batch
                  </p>
                </div>

                {/* Start Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nomor Awal
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bulkStartNumber}
                    onChange={(e) => setBulkStartNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pesan Khusus (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Pesan yang sama untuk semua QR"
                    value={bulkCustomMessage}
                    onChange={(e) => setBulkCustomMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Reward Note */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Catatan Imbalan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Imbalan yang sama untuk semua QR"
                    value={bulkRewardNote}
                    onChange={(e) => setBulkRewardNote(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkForm(false);
                      setBulkPrefix("");
                      setBulkQuantity("10");
                      setBulkStartNumber("1");
                      setBulkCustomMessage("");
                      setBulkRewardNote("");
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isBulkGenerating || !bulkPrefix}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isBulkGenerating ? "Generating..." : "Generate Bulk"}
                  </button>
                </div>
              </div>

              {/* Right Column - Progress */}
              <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                {isBulkGenerating ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      Generating QR Codes...
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {bulkProgress.current} / {bulkProgress.total}
                    </p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-4">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Isi form dan klik "Generate Bulk" untuk membuat multiple QR codes sekaligus
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Results - Printable Layout */}
      {showBulkResults && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 print:shadow-none print:border-none">
          <div className="flex justify-between items-center mb-6 no-print">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Hasil Bulk Generate
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {bulkResults.length} QR code berhasil dibuat
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkResults(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={printBulkResults}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>

          {/* Printable Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:gap-4">
            {bulkResults.map((tag) => (
              <div key={tag.id} className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 print:border-slate-900">
                <div className="bg-white p-3 rounded-lg flex items-center justify-center mb-3">
                  <img
                    src={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/qr?text=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/p/${tag.slug}`)}`}
                    alt={`QR ${tag.name}`}
                    className="w-32 h-32"
                  />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-900 dark:text-white text-sm mb-1 break-words">
                    {tag.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    /p/{tag.slug}
                  </p>
                </div>
                <div className="mt-3 flex gap-2 no-print">
                  <button
                    onClick={() => downloadQR(tag.slug, tag.name)}
                    className="flex-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => openPreview(tag)}
                    className="flex-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Preview QR Code
                </h3>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex items-center justify-center">
                {previewQrData ? (
                  <img src={previewQrData} alt={`QR ${previewTag.name}`} className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Nama:</span> {previewTag.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
                  <span className="font-medium">URL:</span> {process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/p/{previewTag.slug}
                </p>
                {previewTag.customMessage && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Pesan:</span> {previewTag.customMessage}
                  </p>
                )}
                {previewTag.rewardNote && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Imbalan:</span> {previewTag.rewardNote}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => downloadQR(previewTag.slug, previewTag.name)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Download QR
                </button>
                <button
                  onClick={closePreview}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print-modal-overlay">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 no-print">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Print Preview - A4
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {printPreviewQrCodes.length} QR code akan dicetak
                  </p>
                </div>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* A4 Preview Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900">
              <div className="bg-white shadow-lg mx-auto a4-print-container">
                {/* Print Header - only visible in preview, not in actual print */}
                <div className="text-center py-4 border-b-2 border-slate-900 mb-4 no-print">
                  <h2 className="text-lg font-bold text-slate-900">BALIKIN - QR Stok</h2>
                  <p className="text-sm text-slate-600">
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* QR Grid - small top padding for spacing */}
                <div className="px-4 pt-2 pb-4 qr-print-grid">
                  {printPreviewQrCodes.map(({ tag, qrDataUrl }) => (
                    <div key={tag.id} className="qr-print-card">
                      <img
                        src={qrDataUrl}
                        alt={`QR ${tag.name}`}
                        className="qr-print-image"
                      />
                      <p className="font-semibold text-xs text-slate-900 mt-2 truncate px-1">
                        {tag.name}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono truncate px-1">
                        /p/{tag.slug}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Print Footer */}
                <div className="text-center py-2 border-t border-slate-300 mt-2 text-xs text-slate-500 no-print">
                  <p>Generated by BALIKIN - Smart Lost & Found</p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 no-print">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={executePrint}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
