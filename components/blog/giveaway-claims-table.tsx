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
import { Check, X, Gift, Package, Loader2, Eye, MessageSquare } from "lucide-react";

interface GiveawayClaim {
  id: string;
  postId: string;
  quizId: string;
  fullName: string;
  whatsappNumber: string;
  shippingAddress: string;
  score: number;
  status: "pending" | "approved" | "shipped" | "rejected";
  trackingNumber: string | null;
  notes: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
  } | null;
  processor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface GiveawayClaimsTableProps {
  claims: GiveawayClaim[];
  currentUserId: string;
}

export function GiveawayClaimsTable({ claims, currentUserId }: GiveawayClaimsTableProps) {
  const [localClaims, setLocalClaims] = useState(claims);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "shipped" | "rejected">("all");
  const [selectedClaim, setSelectedClaim] = useState<GiveawayClaim | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const filteredClaims = localClaims.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const handleApprove = async (claimId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/giveaway-claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (res.ok) {
        setLocalClaims((prev) =>
          prev.map((c) => (c.id === claimId ? { ...c, status: "approved" as const } : c))
        );
        toast.success("Claim approved!");
      } else {
        toast.error("Failed to approve claim");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve claim");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (claimId: string, reason: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/giveaway-claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
      });

      if (res.ok) {
        setLocalClaims((prev) =>
          prev.map((c) => (c.id === claimId ? { ...c, status: "rejected" as const } : c))
        );
        toast.success("Claim rejected");
        setSelectedClaim(null);
        setRejectReason("");
      } else {
        toast.error("Failed to reject claim");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject claim");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShipped = async (claimId: string, trackingNumber: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/giveaway-claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "shipped", trackingNumber }),
      });

      if (res.ok) {
        setLocalClaims((prev) =>
          prev.map((c) =>
            c.id === claimId ? { ...c, status: "shipped" as const, trackingNumber } : c
          )
        );
        toast.success("Tracking number saved, marked as shipped!");
        setSelectedClaim(null);
        setTrackingNumber("");
      } else {
        toast.error("Failed to update tracking");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update tracking");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNotes = async (claimId: string, notes: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/giveaway-claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        setLocalClaims((prev) =>
          prev.map((c) => (c.id === claimId ? { ...c, notes } : c))
        );
        toast.success("Notes updated!");
      } else {
        toast.error("Failed to update notes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors = {
    pending: "bg-amber-500/10 text-amber-600",
    approved: "bg-emerald-500/10 text-emerald-600",
    shipped: "bg-blue-500/10 text-blue-600",
    rejected: "bg-destructive/10 text-destructive",
  };

  const statusIcons = {
    pending: <Gift className="w-4 h-4" />,
    approved: <Check className="w-4 h-4" />,
    shipped: <Package className="w-4 h-4" />,
    rejected: <X className="w-4 h-4" />,
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">All Claims</h3>
            <Badge variant="secondary">{filteredClaims.length}</Badge>
          </div>

          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Claims</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved (Ready to Ship)</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredClaims.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No claims found</p>
          ) : (
            filteredClaims.map((claim) => (
              <Card key={claim.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{claim.fullName}</span>
                        <Badge className={statusColors[claim.status]}>
                          {statusIcons[claim.status]}
                          <span className="ml-1 capitalize">{claim.status}</span>
                        </Badge>
                        {claim.score && (
                          <Badge variant="outline">Score: {claim.score}%</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {claim.post?.title} • {new Date(claim.createdAt).toLocaleDateString("id-ID")}
                      </p>
                      {claim.processor && (
                        <p className="text-xs text-muted-foreground">
                          Processed by: {claim.processor.name || claim.processor.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">WhatsApp:</p>
                      <p className="font-medium">{claim.whatsappNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Address:</p>
                      <p className="font-medium">{claim.shippingAddress}</p>
                    </div>
                  </div>

                  {claim.trackingNumber && (
                    <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/25 rounded">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        Tracking: {claim.trackingNumber}
                      </span>
                    </div>
                  )}

                  {claim.notes && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Notes:</span> {claim.notes}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {claim.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(claim.id)}
                          disabled={isUpdating}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
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
                              <DialogTitle>Reject Claim</DialogTitle>
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
                                    handleReject(claim.id, rejectReason);
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

                    {claim.status === "approved" && (
                      <Dialog open={selectedClaim?.id === claim.id} onOpenChange={(open) => !open && setSelectedClaim(null)}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setSelectedClaim(claim)}
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Add Tracking
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Tracking Number</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Enter tracking number..."
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  handleShipped(claim.id, trackingNumber);
                                }}
                                disabled={isUpdating || !trackingNumber}
                              >
                                Save & Mark Shipped
                              </Button>
                              <Button variant="outline" onClick={() => {
                                setSelectedClaim(null);
                                setTrackingNumber("");
                              }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/blog/${claim.post?.slug}`, "_blank")}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Post
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`https://wa.me/${claim.whatsappNumber.replace(/^0/, '62')}`, "_blank")}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
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
