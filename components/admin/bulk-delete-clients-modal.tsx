"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Check } from "lucide-react";
import type { User } from "@/db/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface UserWithTags extends User {
  tagCount: number;
}

interface BulkDeleteClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: UserWithTags[];
}

export function BulkDeleteClientsModal({
  isOpen,
  onClose,
  selectedUsers,
}: BulkDeleteClientsModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [success, setSuccess] = useState(false);

  const expectedConfirmText = `DELETE ${selectedUsers.length}`;
  const isConfirmed = confirmText === expectedConfirmText;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfirmed) {
      alert("Ketik konfirmasi dengan benar!");
      return;
    }

    setIsSubmitting(true);

    try {
      const userIds = selectedUsers.map((u) => u.id);

      const response = await fetch("/api/admin/bulk-delete-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete clients");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
        setSuccess(false);
        setConfirmText("");
      }, 1500);
    } catch (error) {
      console.error("Error deleting clients:", error);
      alert("Gagal menghapus klien. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0" aria-describedby="bulk-delete-clients-description">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Hapus {selectedUsers.length} Klien
          </h3>
          <p id="bulk-delete-clients-description" className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tindakan ini tidak dapat dibatalkan
          </p>
        </div>

        {success ? (
          <div role="status" className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium">
              Berhasil menghapus {selectedUsers.length} klien!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                  ⚠️ Peringatan: Menghapus klien akan menghapus:
                </p>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                  <li>Semua data klien</li>
                  <li>Semua tag yang dimiliki klien</li>
                  <li>Riwayat scan semua tag</li>
                  <li>Data modul yang terkait</li>
                </ul>
              </div>

              {/* Selected Users List */}
              <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Klien yang akan dihapus:
                </p>
                <div className="space-y-1">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="text-sm text-gray-900 dark:text-white flex items-center justify-between"
                    >
                      <span>• {user.name || "Tanpa Nama"}</span>
                      <span className="text-xs text-gray-500">({user.tagCount} tag)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation */}
              <div>
                <label htmlFor="bulk-delete-confirm" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Ketik <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {expectedConfirmText}
                  </code> untuk konfirmasi:
                </label>
                <input
                  id="bulk-delete-confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder={expectedConfirmText}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!isConfirmed || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Menghapus...
                  </>
                ) : (
                  `Hapus ${selectedUsers.length} Klien`
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
