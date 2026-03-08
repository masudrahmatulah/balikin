"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import type { User } from "@/db/schema";

interface UserWithTags extends User {
  tagCount: number;
}

interface CreateTagModalProps {
  users: UserWithTags[];
}

export function CreateTagModal({ users }: CreateTagModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [tagName, setTagName] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [rewardNote, setRewardNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !tagName) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: selectedUserId,
          name: tagName,
          slug: nanoid(10),
          contactWhatsapp,
          customMessage,
          rewardNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to create tag");

      // Reset form
      setSelectedUserId("");
      setTagName("");
      setContactWhatsapp("");
      setCustomMessage("");
      setRewardNote("");
      setIsOpen(false);

      router.refresh();
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("Gagal membuat tag. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Buat Tag Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Buat Tag QR Baru
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Select User */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Klien
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih klien...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email} ({user.tagCount} tag)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama Tag / Barang
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

              {/* WhatsApp Contact */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 628123456789"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-0 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {selectedUser ? `Default dari: ${selectedUser.email}` : "Akan diisi dari data klien"}
                </p>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pesan Khusus
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Ini adalah kunci kesayangan saya, tolong dikembalikan ya..."
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

              {/* Actions */}
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
                  disabled={isSubmitting || !selectedUserId || !tagName}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "Membuat..." : "Buat Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
