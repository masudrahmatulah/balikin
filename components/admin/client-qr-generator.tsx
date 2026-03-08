"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import type { User } from "@/db/schema";

interface ClientQRGeneratorProps {
  client: User;
}

export function ClientQRGenerator({ client }: ClientQRGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [rewardNote, setRewardNote] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdTag, setCreatedTag] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: client.id,
          name: tagName,
          slug: nanoid(10),
          contactWhatsapp,
          customMessage,
          rewardNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to create tag");

      const data = await response.json();
      setCreatedTag(data.tag);

      // Generate QR code
      const baseUrl = window.location.origin;
      const tagUrl = `${baseUrl}/p/${data.tag.slug}`;
      const dataUrl = await QRCode.toDataURL(tagUrl, {
        width: 1024,
        margin: 2,
        color: { dark: "#1e293b", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);

      // Reset form
      setTagName("");
      setContactWhatsapp("");
      setCustomMessage("");
      setRewardNote("");
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("Gagal membuat tag. Silakan coba lagi.");
    } finally {
      setIsCreating(false);
    }
  };

  const downloadQR = () => {
    if (!createdTag || !qrDataUrl) return;

    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `balikin-${createdTag.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        Buat Tag + QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Buat Tag untuk {client.name || client.email}
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setCreatedTag(null);
                    setQrDataUrl("");
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {createdTag && qrDataUrl ? (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Tag Berhasil Dibuat!
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {createdTag.name}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 flex justify-center mb-6">
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
                </div>

                <button
                  onClick={downloadQR}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-3"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code (PNG 1024px)
                </button>

                <button
                  onClick={() => {
                    setCreatedTag(null);
                    setQrDataUrl("");
                  }}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Buat Tag Lagi
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nama Tag / Barang *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kunci Motor Nmax"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="628123456789"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pesan Khusus
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Pesan untuk penemu barang..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Catatan Imbalan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Akan memberi imbalan bensin 20k"
                    value={rewardNote}
                    onChange={(e) => setRewardNote(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !tagName}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isCreating ? "Membuat..." : "Buat Tag"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
