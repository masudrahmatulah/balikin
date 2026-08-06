"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/app/actions/admin-client-actions";
import type { User } from "@/db/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: (User & { tagCount: number }) | null;
}

export function DeleteClientModal({ isOpen, onClose, user }: DeleteClientModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!user) return;

    setError("");
    setIsDeleting(true);

    try {
      const result = await deleteClient(user.id);

      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
      } else {
        // Success - show brief success message before closing
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      setError("Gagal menghapus klien. Silakan coba lagi.");
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError("");
      onClose();
    }
  };

  if (!user) return null;

  const displayName = user.name || user.email;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0" aria-describedby="delete-client-description">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Hapus Klien
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
          </div>

          {/* Warning Message */}
          <div id="delete-client-description" className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Apakah Anda yakin?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Anda akan menghapus klien:
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>

            {/* Cascade Warning */}
            {user.tagCount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Perhatian: Penghapusan Cascade
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      {user.tagCount} tag milik klien ini juga akan dihapus permanen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Tindakan ini tidak dapat dibatalkan!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
