"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getVerificationQueue } from "@/app/admin/actions/overview-actions";
import { ShieldCheck, ShieldX, Clock, UserCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
}

export function VerificationQueue() {
  const router = useRouter();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await getVerificationQueue(10);
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch verification queue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(requests.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleApprove = async (ids?: string[]) => {
    setIsProcessing(true);
    const idsToApprove = ids || Array.from(selectedIds);

    try {
      // In production, this would call your verification API
      console.log("Approving:", idsToApprove);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove approved from list
      setRequests(prev => prev.filter(r => !idsToApprove.includes(r.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);

    try {
      // In production, this would call your verification API
      console.log("Rejecting:", id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove rejected from list
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 3)}***@${domain}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Verification Queue
          </CardTitle>
          <CardDescription className="mt-1">
            Pending Gold Badge verification requests
          </CardDescription>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          {requests.length} pending
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending verification requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedIds.size} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove()}
                    disabled={isProcessing}
                    className="gap-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIds(new Set())}
                    disabled={isProcessing}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <Checkbox
                checked={requests.length > 0 && selectedIds.size === requests.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="flex-1">User</span>
              <span className="w-16 text-right">Time</span>
              <span className="w-24 text-right">Actions</span>
            </div>

            {/* List */}
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.has(request.id)}
                    onCheckedChange={(checked) => handleSelect(request.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{request.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{maskEmail(request.email)}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                    {formatTimeAgo(request.requestedAt)}
                  </span>
                  <div className="flex gap-1 w-24 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/admin/client/${request.id}`)}
                      className="h-8 w-8 p-0"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleApprove([request.id])}
                      disabled={isProcessing}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(request.id)}
                      disabled={isProcessing}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <ShieldX className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {requests.length >= 10 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/admin/client")}
              >
                View All Requests
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VerificationQueueSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}