"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, Video, Loader2, Eye, ExternalLink, Award } from "lucide-react";

interface TrueStorySubmission {
  id: string;
  fullName: string;
  whatsappNumber: string;
  storyTitle: string;
  storyDescription: string;
  videoUrl: string;
  balikinTagId: string;
  jacketSize: "S" | "M" | "L" | "XL" | "XXL";
  status: "pending" | "verified" | "winner_jacket" | "rejected";
  shippingAddress: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface TrueStoriesTableProps {
  submissions: TrueStorySubmission[];
  currentUserId: string;
}

export function TrueStoriesTable({ submissions, currentUserId }: TrueStoriesTableProps) {
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "winner_jacket" | "rejected">("all");
  const [selectedSubmission, setSelectedSubmission] = useState<TrueStorySubmission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const filteredSubmissions = localSubmissions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const handleVerify = async (submissionId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/true-stories/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified" }),
      });

      if (res.ok) {
        setLocalSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, status: "verified" as const } : s))
        );
        toast.success("Story verified!");
      } else {
        toast.error("Failed to verify story");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify story");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAwardJacket = async (submissionId: string, address: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/true-stories/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "winner_jacket", shippingAddress: address }),
      });

      if (res.ok) {
        setLocalSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId
              ? { ...s, status: "winner_jacket" as const, shippingAddress: address }
              : s
          )
        );
        toast.success("Jacket awarded! Winner will be notified.");
        setSelectedSubmission(null);
        setShippingAddress("");
      } else {
        toast.error("Failed to award jacket");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to award jacket");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (submissionId: string, reason: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/true-stories/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
      });

      if (res.ok) {
        setLocalSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, status: "rejected" as const } : s))
        );
        toast.success("Submission rejected");
        setSelectedSubmission(null);
        setRejectReason("");
      } else {
        toast.error("Failed to reject submission");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject submission");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors = {
    pending: "bg-amber-500/10 text-amber-600",
    verified: "bg-blue-500/10 text-blue-600",
    winner_jacket: "bg-emerald-500/10 text-emerald-600",
    rejected: "bg-destructive/10 text-destructive",
  };

  const statusLabels = {
    pending: "Pending Review",
    verified: "Verified",
    winner_jacket: "🏆 Jacket Winner",
    rejected: "Rejected",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">All Submissions</h3>
            <Badge variant="secondary">{filteredSubmissions.length}</Badge>
          </div>

          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="verified">Verified (Awaiting Jacket)</SelectItem>
              <SelectItem value="winner_jacket">Jacket Winners</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No submissions found</p>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{submission.fullName}</span>
                        <Badge className={statusColors[submission.status]}>
                          {statusLabels[submission.status]}
                        </Badge>
                        <Badge variant="outline">Size: {submission.jacketSize}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tag: <span className="font-mono">{submission.balikinTagId}</span> •{" "}
                        {new Date(submission.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline text-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Watch Video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>
                    <h4 className="font-medium">{submission.storyTitle}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {submission.storyDescription}
                    </p>
                  </div>

                  {submission.shippingAddress && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded">
                      <p className="text-sm font-medium text-emerald-600">Shipping Address:</p>
                      <p className="text-sm text-emerald-700">{submission.shippingAddress}</p>
                    </div>
                  )}

                  {submission.rejectionReason && (
                    <div className="p-3 bg-destructive/10 border border-destructive/25 rounded">
                      <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                      <p className="text-sm text-destructive/80">{submission.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {submission.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleVerify(submission.id)}
                          disabled={isUpdating}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Verify Story
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" disabled={isUpdating}>
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Submission</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    handleReject(submission.id, rejectReason);
                                    setRejectReason("");
                                  }}
                                  disabled={isUpdating}
                                >
                                  Confirm Reject
                                </Button>
                                <Button variant="outline" onClick={() => setRejectReason("")}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}

                    {submission.status === "verified" && (
                      <Dialog open={selectedSubmission?.id === submission.id} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Award className="w-4 h-4 mr-1" />
                            Award Jacket
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Award Jacket & Get Shipping Info</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Awarding a jacket to: <strong>{submission.fullName}</strong>
                            </p>
                            <Textarea
                              placeholder="Enter complete shipping address..."
                              value={shippingAddress}
                              onChange={(e) => setShippingAddress(e.target.value)}
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  handleAwardJacket(submission.id, shippingAddress);
                                }}
                                disabled={isUpdating || !shippingAddress}
                              >
                                Confirm & Award Jacket
                              </Button>
                              <Button variant="outline" onClick={() => {
                                setSelectedSubmission(null);
                                setShippingAddress("");
                              }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
