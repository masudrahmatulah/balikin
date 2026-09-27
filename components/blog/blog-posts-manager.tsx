"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckSquare, Edit, ExternalLink, Eye, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BlogPostItem = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  isPublished: boolean;
};

type PostStatus = "all" | "draft" | "scheduled" | "published";
type SortOrder = "newest" | "oldest" | "title" | "scheduled" | "published";

const statusLabels: Record<PostStatus, string> = {
  all: "Semua",
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

function getPostStatus(post: BlogPostItem): Exclude<PostStatus, "all"> {
  if (post.isPublished) return "published";
  if (post.scheduledAt) return "scheduled";
  return "draft";
}

function defaultStartDateTime() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const local = new Date(start.getTime() - start.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function BlogPostsManager({ posts, initialStatus = "all" }: { posts: BlogPostItem[]; initialStatus?: PostStatus }) {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<PostStatus>(initialStatus);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startAt, setStartAt] = useState(defaultStartDateTime);
  const [intervalDays, setIntervalDays] = useState("1");
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    setActiveStatus(initialStatus);
  }, [initialStatus]);

  const draftPosts = useMemo(() => posts.filter((post) => getPostStatus(post) === "draft"), [posts]);
  const statusCounts = useMemo(() => ({
    all: posts.length,
    draft: draftPosts.length,
    scheduled: posts.filter((post) => getPostStatus(post) === "scheduled").length,
    published: posts.filter((post) => getPostStatus(post) === "published").length,
  }), [posts, draftPosts]);

  const selectedDrafts = useMemo(
    () => draftPosts.filter((post) => selectedIds.includes(post.id)),
    [draftPosts, selectedIds],
  );

  const visiblePosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    const result = posts.filter((post) => {
      const matchesStatus = activeStatus === "all" || getPostStatus(post) === activeStatus;
      const matchesSearch = !query || `${post.title} ${post.slug}`.toLocaleLowerCase("id-ID").includes(query);
      return matchesStatus && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortOrder === "title") return a.title.localeCompare(b.title, "id-ID");
      if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === "scheduled") return (a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity) - (b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity);
      if (sortOrder === "published") return (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) - (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, activeStatus, search, sortOrder]);

  const previewSchedule = useMemo(() => {
    const firstDate = new Date(startAt);
    const days = Number(intervalDays);
    if (!Number.isFinite(firstDate.getTime()) || !Number.isInteger(days) || days < 1) return [];
    return selectedDrafts.map((post, index) => ({
      ...post,
      scheduledAt: new Date(firstDate.getTime() + index * days * 24 * 60 * 60 * 1000),
    }));
  }, [selectedDrafts, startAt, intervalDays]);

  const selectStatus = (status: PostStatus) => {
    setActiveStatus(status);
    setSelectedIds([]);
    router.replace(status === "all" ? "/admin/blog" : `/admin/blog?status=${status}`, { scroll: false });
  };

  const toggleDraft = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  };

  const toggleAllDrafts = () => {
    setSelectedIds((current) => current.length === draftPosts.length ? [] : draftPosts.map((post) => post.id));
  };

  const scheduleSelected = async () => {
    const firstDate = new Date(startAt);
    const days = Number(intervalDays);
    if (!selectedIds.length) return toast.error("Pilih minimal satu draft.");
    if (!Number.isFinite(firstDate.getTime()) || firstDate <= new Date()) return toast.error("Waktu mulai harus di masa depan.");
    if (!Number.isInteger(days) || days < 1 || days > 365) return toast.error("Jarak hari harus antara 1 sampai 365.");

    setIsScheduling(true);
    try {
      const response = await fetch("/api/admin/blog/bulk-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: selectedIds, startAt: firstDate.toISOString(), intervalDays: days }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Draft gagal dijadwalkan.");

      toast.success(`${result.scheduled} artikel berhasil dijadwalkan.`);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Draft gagal dijadwalkan.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-5">
      {(activeStatus === "all" || activeStatus === "draft") && <section className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-5 w-5 text-primary" />Bulk Schedule Draft</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pilih draft, lalu atur jadwal publikasi berurutan.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={toggleAllDrafts} disabled={draftPosts.length === 0}>
            <CheckSquare className="mr-2 h-4 w-4" />
            {selectedIds.length === draftPosts.length && draftPosts.length > 0 ? "Batalkan pilihan" : "Pilih semua draft"}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Jadwalkan pertama mulai</span>
            <Input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Jarak antarartikel (hari)</span>
            <Input type="number" min={1} max={365} step={1} value={intervalDays} onChange={(event) => setIntervalDays(event.target.value)} />
          </label>
        </div>

        {selectedDrafts.length > 0 && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-3">
            <p className="mb-2 text-sm font-medium">Pratinjau jadwal ({selectedDrafts.length})</p>
            <ol className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {previewSchedule.map((item, index) => (
                <li key={item.id} className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
                  <span className="min-w-0 truncate">{index + 1}. {item.title}</span>
                  <time className="shrink-0 text-xs text-muted-foreground">{item.scheduledAt.toLocaleString("id-ID")}</time>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={scheduleSelected} disabled={isScheduling || selectedIds.length === 0}>
            {isScheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />}
            {isScheduling ? "Menjadwalkan..." : `Jadwalkan ${selectedIds.length || "draft terpilih"}`}
          </Button>
          <span className="text-xs text-muted-foreground">Mengikuti zona waktu perangkat. Jadwal diproses cron harian paket Hobby.</span>
        </div>
      </section>}

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap gap-2 border-b p-4">
          {(Object.keys(statusLabels) as PostStatus[]).map((status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={activeStatus === status ? "default" : "outline"}
              onClick={() => selectStatus(status)}
            >
              {statusLabels[status]} <span className="ml-1 opacity-75">({statusCounts[status]})</span>
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul atau slug..." className="pl-9" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-muted-foreground">Urutkan</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)} className="h-10 rounded-md border bg-background px-3">
              <option value="newest">Terbaru dibuat</option>
              <option value="oldest">Terlama dibuat</option>
              <option value="title">Judul A-Z</option>
              <option value="scheduled">Jadwal terdekat</option>
              <option value="published">Publikasi terbaru</option>
            </select>
          </label>
        </div>

        {visiblePosts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Tidak ada artikel yang cocok dengan filter ini.</div>
        ) : (
          <div className="divide-y">
            {visiblePosts.map((post) => {
              const status = getPostStatus(post);
              return (
                <div key={post.id} className="flex items-center gap-3 p-4 hover:bg-accent/50">
                  {status === "draft" ? (
                    <input
                      type="checkbox"
                      aria-label={`Pilih ${post.title || "draft"} untuk bulk schedule`}
                      checked={selectedIds.includes(post.id)}
                      onChange={() => toggleDraft(post.id)}
                      className="h-4 w-4 shrink-0 accent-primary"
                    />
                  ) : <span className="h-4 w-4 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-medium">{post.title || "Untitled"}</h3>
                      <span className={`rounded px-2 py-0.5 text-xs ${status === "published" ? "bg-emerald-500/10 text-emerald-700" : status === "scheduled" ? "bg-blue-500/10 text-blue-700" : "bg-amber-500/10 text-amber-700"}`}>
                        {statusLabels[status]}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{post.slug}</p>
                    {status === "scheduled" && post.scheduledAt && (
                      <p className="mt-1 text-xs text-blue-700">Terjadwal: {new Date(post.scheduledAt).toLocaleString("id-ID")}</p>
                    )}
                    {status === "published" && post.publishedAt && (
                      <p className="mt-1 text-xs text-muted-foreground">Dipublikasikan: {new Date(post.publishedAt).toLocaleString("id-ID")}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button asChild type="button" variant="ghost" size="icon" title="Edit artikel">
                      <Link href={`/admin/blog/${post.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button asChild type="button" variant="ghost" size="icon" title="Preview artikel">
                      <Link href={`/admin/blog/${post.id}/preview`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    {status === "published" && (
                      <Button asChild type="button" variant="ghost" size="icon" title="Buka artikel publik">
                        <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
