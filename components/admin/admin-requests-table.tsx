'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, X, Check, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getModuleDisplayName, getModuleColor, getAllModules } from '@/lib/admin-modules';
import { approveModuleRequest, rejectModuleRequest } from '@/app/actions/module-request-actions';

interface PendingRequest {
  id: string;
  userId: string;
  moduleType: string;
  reason: string | null;
  requestedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface AdminRequestsTableProps {
  pendingRequests: PendingRequest[];
}

export function AdminRequestsTable({ pendingRequests }: AdminRequestsTableProps) {
  const router = useRouter();
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const allModules = getAllModules();
  const isAllSelected = pendingRequests.length > 0 && selectedRequestIds.size === pendingRequests.length;
  const isSomeSelected = selectedRequestIds.size > 0 && !isAllSelected;

  const toggleRequestSelection = (requestId: string) => {
    const newSelected = new Set(selectedRequestIds);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequestIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequestIds(new Set(pendingRequests.map((r) => r.id)));
    } else {
      setSelectedRequestIds(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedRequestIds(new Set());
  };

  const handleBulkApprove = async () => {
    setIsBulkProcessing(true);
    setBulkProgress({ current: 0, total: selectedRequestIds.size });

    try {
      const ids = Array.from(selectedRequestIds);
      for (let i = 0; i < ids.length; i++) {
        await approveModuleRequest(ids[i]);
        setBulkProgress({ current: i + 1, total: ids.length });
      }

      alert(`${ids.length} permintaan berhasil di-approve!`);
      clearSelection();
      router.refresh();
    } catch (error) {
      console.error('Bulk approve error:', error);
      alert('Gagal melakukan bulk approve. Silakan coba lagi.');
    } finally {
      setIsBulkProcessing(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const handleBulkReject = async () => {
    const reason = prompt('Alasan reject (opsional):');
    setIsBulkProcessing(true);
    setBulkProgress({ current: 0, total: selectedRequestIds.size });

    try {
      const ids = Array.from(selectedRequestIds);
      for (let i = 0; i < ids.length; i++) {
        await rejectModuleRequest({ requestId: ids[i], rejectionReason: reason || undefined });
        setBulkProgress({ current: i + 1, total: ids.length });
      }

      alert(`${ids.length} permintaan berhasil di-reject!`);
      clearSelection();
      router.refresh();
    } catch (error) {
      console.error('Bulk reject error:', error);
      alert('Gagal melakukan bulk reject. Silakan coba lagi.');
    } finally {
      setIsBulkProcessing(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  return (
    <>
      {selectedRequestIds.size > 0 && (
        <div className='sticky top-4 z-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm mb-4'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                <CheckCircle2 className='w-5 h-5 text-white' />
              </div>
              <div>
                <p className='text-sm font-semibold text-blue-900 dark:text-blue-300'>
                  {selectedRequestIds.size} Permintaan Terpilih
                </p>
                {isBulkProcessing && (
                  <p className='text-xs text-blue-700 dark:text-blue-400'>
                    Processing: {bulkProgress.current}/{bulkProgress.total}
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button
                onClick={handleBulkApprove}
                disabled={isBulkProcessing}
                className='inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isBulkProcessing ? 'Processing...' : 'Approve All'}
              </button>
              <button
                onClick={handleBulkReject}
                disabled={isBulkProcessing}
                className='inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isBulkProcessing ? 'Processing...' : 'Reject All'}
              </button>
              <button
                onClick={clearSelection}
                disabled={isBulkProcessing}
                className='inline-flex items-center px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-200 dark:border-slate-700'>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
            Daftar Permintaan
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <div className='p-12 text-center'>
            <svg
              className='w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <p className='text-slate-600 dark:text-slate-400'>
              Tidak ada permintaan pending
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-slate-50 dark:bg-slate-900/50'>
                <tr>
                  <th className='px-4 py-3 text-left'>
                    <input
                      type='checkbox'
                      checked={isAllSelected}
                      ref={(input) => {
                        if (isSomeSelected && input) {
                          input.indeterminate = true;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className='w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500'
                    />
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                    Modul
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                    Alasan
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                    Tanggal Request
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 dark:divide-slate-700'>
                {pendingRequests.map((request) => {
                  const requestedDate = new Date(request.requestedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={request.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                        selectedRequestIds.has(request.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <td className='px-4 py-4'>
                        <input
                          type='checkbox'
                          checked={selectedRequestIds.has(request.id)}
                          onChange={() => toggleRequestSelection(request.id)}
                          className='w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500'
                        />
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-slate-900 dark:text-white'>
                            {request.user.name || 'Tanpa Nama'}
                          </div>
                          <div className='text-sm text-slate-500 dark:text-slate-400'>
                            {request.user.email}
                          </div>
                        </div>
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Badge className={`${getModuleColor(request.moduleType)} text-white`}>
                          {getModuleDisplayName(request.moduleType)}
                        </Badge>
                      </td>

                      <td className='px-6 py-4'>
                        <p className='text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate'>
                          {request.reason || '-'}
                        </p>
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400'>
                        {requestedDate}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-right'>
                        <form className='flex gap-2 justify-end'>
                          <button
                            formAction={async () => {
                              'use server';
                              await approveModuleRequest(request.id);
                            }}
                            className='inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors'
                          >
                            <Check className='w-3 h-3 mr-1' />
                            Approve
                          </button>
                          <button
                            formAction={async () => {
                              'use server';
                              await rejectModuleRequest({ requestId: request.id });
                            }}
                            className='inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors'
                          >
                            <X className='w-3 h-3 mr-1' />
                            Reject
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
