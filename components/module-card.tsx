"use client";

import { useState } from "react";
import { Lock, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getModuleColor, type ModuleInfo, type ModuleType } from "@/lib/admin-modules";
import { ModuleRequestModal } from "./module-request-modal";

interface ModuleCardProps {
  module: ModuleInfo;
  isEnabled: boolean;
  hasPendingRequest?: boolean;
  onModuleAccess?: (moduleType: ModuleType) => void;
}

export function ModuleCard({
  module,
  isEnabled,
  hasPendingRequest = false,
  onModuleAccess,
}: ModuleCardProps) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const Icon = module.icon;

  const handleAccess = () => {
    if (onModuleAccess) {
      onModuleAccess(module.type);
    }
  };

  const handleRequest = () => {
    setIsRequestModalOpen(true);
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl border-2 transition-all ${
          isEnabled
            ? `${module.color.replace('bg-', 'border-')} bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900`
            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50'
        }`}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isEnabled ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : hasPendingRequest ? (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`p-3 rounded-xl ${
                isEnabled
                  ? module.color
                  : 'bg-slate-200 dark:bg-slate-700'
              } text-white shrink-0`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                {module.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {module.description}
              </p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Benefit utama:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {module.benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {isEnabled ? (
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
                  ) : (
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                  )}
                  <span className={!isEnabled ? "text-slate-500 dark:text-slate-500" : ""}>
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {isEnabled ? (
              <Button
                onClick={handleAccess}
                className={`w-full ${module.color} hover:opacity-90 text-white font-medium`}
              >
                Buka {module.name}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            ) : hasPendingRequest ? (
              <Button
                disabled
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
              >
                <Clock className="w-4 h-4 mr-2" />
                Menunggu Approval...
              </Button>
            ) : (
              <Button
                onClick={handleRequest}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              >
                <Lock className="w-4 h-4 mr-2" />
                Request Akses - Coba Gratis
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <ModuleRequestModal
          module={module}
          onClose={() => setIsRequestModalOpen(false)}
        />
      )}
    </>
  );
}
