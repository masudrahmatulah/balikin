"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getModuleInfo,
  getModuleIcon,
  type ModuleType
} from "@/lib/admin-modules";
import { requestModule } from "@/app/actions/module-request-actions";
import { useRouter } from "next/navigation";

interface ModuleRequestModalProps {
  moduleType: ModuleType;
  onClose: () => void;
}

export function ModuleRequestModal({ moduleType, onClose }: ModuleRequestModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const module = getModuleInfo(moduleType);
  const Icon = getModuleIcon(moduleType);

  if (!module) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await requestModule({
        moduleType: module.type as ModuleType,
        reason: reason || undefined,
      });

      // Show success message
      alert(
        `Permintaan modul ${module.name} berhasil dikirim!\n\nAdmin akan memproses permintaan Anda. Anda akan mendapatkan notifikasi setelah permintaan disetujui.`
      );

      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal mengirim permintaan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${module.color} text-white`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Request {module.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gratis - Tanpa komitmen
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Module Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              {module.name}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {module.description}
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {module.benefits.slice(0, 2).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Alasan Request (Opsional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ceritakan kenapa Anda ingin mencoba modul ini..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              🔔 Admin akan menerima notifikasi WhatsApp tentang permintaan Anda.
              Proses approval biasanya memakan waktu 1-24 jam.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
