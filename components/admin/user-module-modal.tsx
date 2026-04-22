"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getAllModules, getModuleIcon, type ModuleType } from "@/lib/admin-modules";
import { setUserModulePermission, getUserModulePermissions } from "@/app/actions/admin-module-actions";
import type { UserModulePermission } from "@/db/schema";
import type { LucideIcon } from "lucide-react";

interface UserModuleModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentPermissions: UserModulePermission[];
  onClose?: () => void;
  children?: React.ReactNode;
}

export function UserModuleModal({
  userId,
  userName,
  userEmail,
  currentPermissions,
  onClose,
  children,
}: UserModuleModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modules, setModules] = useState(
    getAllModules().map((module) => ({
      ...module,
      isEnabled: currentPermissions.some(
        (p) => p.moduleType === module.type && p.isEnabled
      ),
      reason: currentPermissions.find((p) => p.moduleType === module.type)?.reason || "",
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const IconComponent = ({ module }: { module: typeof modules[0] }) => {
    const Icon = module.icon as LucideIcon;
    return <Icon className="w-6 h-6" />;
  };

  const handleToggle = (moduleType: ModuleType, enabled: boolean) => {
    setModules((prev) =>
      prev.map((m) => (m.type === moduleType ? { ...m, isEnabled: enabled } : m))
    );
  };

  const handleReasonChange = (moduleType: ModuleType, reason: string) => {
    setModules((prev) =>
      prev.map((m) => (m.type === moduleType ? { ...m, reason } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update all module permissions
      for (const module of modules) {
        await setUserModulePermission({
          userId,
          moduleType: module.type,
          isEnabled: module.isEnabled,
          reason: module.reason || undefined,
        });
      }

      alert(`Modul untuk ${userName} berhasil diperbarui!`);
      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Error updating module permissions:", error);
      alert("Gagal memperbarui modul. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {children ? (
        <div onClick={handleOpen}>{children}</div>
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Kelola Modul
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Kelola Modul User
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {userName} ({userEmail})
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {modules.map((module) => (
            <div
              key={module.type}
              className={`p-4 rounded-xl border-2 transition-all ${
                module.isEnabled
                  ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                  : "border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${module.color} text-white shrink-0`}
                  >
                    <IconComponent module={module} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {module.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={module.isEnabled}
                  onCheckedChange={(checked) => handleToggle(module.type, checked)}
                  disabled={isSubmitting}
                  className="shrink-0"
                />
              </div>

              {/* Benefits List */}
              {module.isEnabled && (
                <div className="mt-3 pl-11">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Benefit utama:
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {module.benefits.slice(0, 3).map((benefit, idx) => (
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
              )}

              {/* Reason Input */}
              <div className="mt-3 pl-11">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Alasan (opsional):
                </label>
                <input
                  type="text"
                  value={module.reason}
                  onChange={(e) => handleReasonChange(module.type, e.target.value)}
                  placeholder={module.isEnabled ? "Contoh: Request via WhatsApp" : "Alasan dinonaktifkan"}
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
      )}
    </>
  );
}
