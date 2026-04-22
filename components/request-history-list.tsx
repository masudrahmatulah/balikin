"use client";

import { Clock, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getModuleDisplayName, getModuleColor } from "@/lib/admin-modules";

interface RequestHistoryListProps {
  requests: Array<{
    id: string;
    moduleType: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    reviewedAt?: Date | null;
    reason?: string | null;
    rejectionReason?: string | null;
  }>;
}

export function RequestHistoryList({ requests }: RequestHistoryListProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Belum ada riwayat permintaan modul
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Request modul untuk melihat riwayat di sini
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Daftar Permintaan
        </h3>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {requests.map((request) => {
          const moduleDisplayName = getModuleDisplayName(request.moduleType);
          const moduleColor = getModuleColor(request.moduleType);
          const requestedDate = new Date(request.requestedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={request.id}
              className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Side */}
                <div className="flex-1">
                  {/* Module Name & Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${moduleColor} text-white`}>
                      {moduleDisplayName}
                    </Badge>
                    <StatusBadge status={request.status} />
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Requested: {requestedDate}</span>
                  </div>

                  {/* Request Reason */}
                  {request.reason && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Alasan Request:
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {request.reason}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                        Alasan Ditolak:
                      </p>
                      <p className="text-sm text-red-900 dark:text-red-300">
                        {request.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Reviewed Date */}
                  {request.reviewedAt && (
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                      Diproses: {new Date(request.reviewedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  if (status === 'pending') {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  }

  if (status === 'approved') {
    return (
      <Badge className="bg-green-500 hover:bg-green-600 text-white">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    );
  }

  return (
    <Badge className="bg-red-500 hover:bg-red-600 text-white">
      <XCircle className="w-3 h-3 mr-1" />
      Rejected
    </Badge>
  );
}
