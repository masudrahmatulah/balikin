"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Award, Reply, X } from "lucide-react";

interface Comment {
  id: string;
  parentId?: string;
  name: string;
  commentText: string;
  isGiveawayWinner: boolean;
  hasHeroBadge: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface BlogCommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function BlogCommentSection({ postId, initialComments }: BlogCommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(buildCommentTree(initialComments));
  const [form, setForm] = useState({ name: '', whatsapp: '', commentText: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map and initialize replies arrays
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree
    flatComments.forEach(comment => {
      const node = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies!.push(node);
      } else {
        rootComments.push(node);
      }
    });

    return rootComments;
  };

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, parentId, ...form })
      });

      if (res.ok) {
        const newComment = await res.json();
        if (parentId) {
          // Add as reply
          setComments(prevComments => {
            const addToReplies = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                if (comment.id === parentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment]
                  };
                }
                if (comment.replies) {
                  return { ...comment, replies: addToReplies(comment.replies) };
                }
                return comment;
              });
            };
            return addToReplies(prevComments);
          });
          setReplyingTo(null);
        } else {
          // Add as root comment
          setComments([newComment, ...comments]);
        }
        setForm({ name: '', whatsapp: '', commentText: '' });
        setSuccessMsg(parentId ? "Balasan berhasil dipublikasikan!" : "Komentar berhasil dipublikasikan! Semoga beruntung mendapatkan stiker.");
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengirim komentar.");
      }
    } catch (err) {
      console.error("Gagal mengirim komentar", err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={`border transition-all ${comment.isGiveawayWinner ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'bg-card'} ${isReply ? 'ml-4 mt-3 border-l-4' : ''}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{comment.name}</span>
            {comment.hasHeroBadge && (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/25 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                <Award className="w-3 h-3" /> Hero Survivor
              </span>
            )}
            {comment.isGiveawayWinner && (
              <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                🏆 Winner
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('id-ID')}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              {replyingTo === comment.id ? <X className="w-3 h-3" /> : <Reply className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{comment.commentText}</p>

        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmit(e, comment.id)} className="space-y-2 mt-3 bg-muted/30 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nama"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-card h-8 text-sm"
              />
              <Input
                placeholder="WhatsApp"
                type="tel"
                required
                value={form.whatsapp}
                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                className="bg-card h-8 text-sm"
              />
            </div>
            <Textarea
              placeholder="Tulis balasan..."
              rows={2}
              required
              value={form.commentText}
              onChange={e => setForm({ ...form, commentText: e.target.value })}
              className="bg-card text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" type="submit" disabled={isSubmitting} className="h-8">
                {isSubmitting ? "Mengirim..." : "Balas"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => setReplyingTo(null)}
                className="h-8"
              >
                Batal
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 my-12 border-t pt-8 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Kolom Cerita & Giveaway 🎁
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Punya pengalaman kehilangan barang? Tulis ceritamu di bawah! Tiap minggu, **3 komentar paling menarik** mendapatkan **2 stiker eksklusif BALIKIN** gratis.
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-3 bg-muted/40 p-4 rounded-xl border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Nama Panggilan" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-card" />
          <Input placeholder="No. WhatsApp (Disembunyikan dari publik)" type="tel" required value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="bg-card" />
        </div>
        <Textarea placeholder="Ceritakan kepanikanmu, atau bagaimana caramu mencari barang tersebut..." rows={3} required value={form.commentText} onChange={e => setForm({...form, commentText: e.target.value})} className="bg-card" />

        {successMsg && <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>}

        <Button size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Cerita & Ikut Giveaway"}
        </Button>
      </form>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Diskusi Pembaca ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h4>
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Belum ada cerita masuk. Mulai diskusi pertamamu!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <CommentCard comment={comment} />
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4">
                  {comment.replies.map(reply => (
                    <CommentCard key={reply.id} comment={reply} isReply />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
