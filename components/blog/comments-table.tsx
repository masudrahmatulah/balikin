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
import { Check, X, MessageSquare, Award, Loader2, Eye } from "lucide-react";

interface Comment {
  id: string;
  postId: string;
  userId: string | null;
  name: string;
  commentText: string;
  whatsappNumber: string;
  isApproved: boolean;
  isGiveawayWinner: boolean;
  hasHeroBadge: boolean;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface CommentsTableProps {
  comments: Comment[];
  currentUserId: string;
}

export function CommentsTable({ comments, currentUserId }: CommentsTableProps) {
  const [localComments, setLocalComments] = useState(comments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredComments = localComments.filter((c) => {
    if (filter === "all") return true;
    if (filter === "pending") return !c.isApproved;
    if (filter === "approved") return c.isApproved;
    if (filter === "rejected") return false;
    return true;
  });

  const handleApprove = async (commentId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });

      if (res.ok) {
        setLocalComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, isApproved: true } : c))
        );
        toast.success("Comment approved!");
      } else {
        toast.error("Failed to approve comment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve comment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (commentId: string, reason: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false, rejectionReason: reason }),
      });

      if (res.ok) {
        setLocalComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, isApproved: false } : c))
        );
        toast.success("Comment rejected");
        setSelectedComment(null);
      } else {
        toast.error("Failed to reject comment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject comment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkWinner = async (commentId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGiveawayWinner: true }),
      });

      if (res.ok) {
        setLocalComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, isGiveawayWinner: true } : c))
        );
        toast.success("Marked as giveaway winner!");
      } else {
        toast.error("Failed to mark as winner");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark as winner");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAwardBadge = async (commentId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasHeroBadge: true }),
      });

      if (res.ok) {
        setLocalComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, hasHeroBadge: true } : c))
        );
        toast.success("Hero badge awarded!");
      } else {
        toast.error("Failed to award badge");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to award badge");
    } finally {
      setIsUpdating(false);
    }
  };

  const [rejectReason, setRejectReason] = useState("");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">All Comments</h3>
            <Badge variant="secondary">{filteredComments.length}</Badge>
          </div>

          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No comments found</p>
          ) : (
            filteredComments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.name}</span>
                        {comment.author && (
                          <Badge variant="outline" className="text-xs">
                            Registered User
                          </Badge>
                        )}
                        {comment.isGiveawayWinner && (
                          <Badge className="bg-emerald-500">🏆 Winner</Badge>
                        )}
                        {comment.hasHeroBadge && (
                          <Badge variant="secondary" className="border-amber-500 text-amber-600">
                            <Award className="w-3 h-3 mr-1" />
                            Hero Survivor
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {comment.post?.title} • {new Date(comment.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <Badge variant={comment.isApproved ? "default" : "secondary"}>
                      {comment.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed">{comment.commentText}</p>

                  <div className="flex items-center gap-2 pt-2">
                    {!comment.isApproved ? (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(comment.id)}
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
                              <DialogTitle>Reject Comment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reason for rejection (optional)..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    handleReject(comment.id, rejectReason);
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
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkWinner(comment.id)}
                          disabled={isUpdating || comment.isGiveawayWinner}
                        >
                          <Award className="w-4 h-4 mr-1" />
                          Mark Winner
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAwardBadge(comment.id)}
                          disabled={isUpdating || comment.hasHeroBadge}
                        >
                          <Award className="w-4 h-4 mr-1" />
                          Hero Badge
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/blog/${comment.post?.slug}#${comment.id}`, "_blank")}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </>
                    )}
                  </div>

                  {comment.whatsappNumber && (
                    <p className="text-xs text-muted-foreground">
                      WhatsApp: {comment.whatsappNumber}
                    </p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
