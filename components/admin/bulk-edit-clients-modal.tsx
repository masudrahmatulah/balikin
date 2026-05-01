"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import type { User } from "@/db/schema";

interface UserWithTags extends User {
  tagCount: number;
}

interface BulkEditClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: UserWithTags[];
}

export function BulkEditClientsModal({
  isOpen,
  onClose,
  selectedUsers,
}: BulkEditClientsModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userIds = selectedUsers.map((u) => u.id);

      const response = await fetch("/api/admin/bulk-update-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update clients");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error updating clients:", error);
      alert("Gagal mengupdate klien. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit {selectedUsers.length} Klien
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ubah role untuk {selectedUsers.length} klien yang dipilih
          </p>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium">
              Berhasil mengupdate {selectedUsers.length} klien!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Selected Users List */}
              <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Klien yang akan diupdate:
                </p>
                <div className="space-y-1">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="text-sm text-gray-900 dark:text-white"
                    >
                      • {user.name || "Tanpa Nama"} ({user.email})
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Ubah Role Menjadi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("user")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedRole === "user"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        User
                      </span>
                      {selectedRole === "user" && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Akses dasar dashboard
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("admin")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedRole === "admin"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Admin
                      </span>
                      {selectedRole === "admin" && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Akses penuh admin
                    </p>
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-400">
                  ⚠️ Perubahan akan diterapkan ke semua {selectedUsers.length} klien yang
                  dipilih. Pastikan Anda sudah memeriksa daftar klien dengan benar.
                </p>
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
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  `Update ${selectedUsers.length} Klien`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
