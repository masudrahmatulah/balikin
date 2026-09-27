"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarClock, CheckSquare, Edit, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Draft = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
};

function defaultStartDateTime() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const local = new Date(start.getTime() - start.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function BulkScheduleDrafts({ drafts }: { drafts: Draft[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startAt, setStartAt] = useState(defaultStartDateTime);
  const [intervalDays, setIntervalDays] = useState("1");
  const [isScheduling, setIsScheduling] = useState(false);

  const selectedDrafts = useMemo(
    () => drafts.filter((draft) => selectedIds.includes(draft.id)),
    [drafts, selectedIds],
  );

  const previewSchedule = useMemo(() => {
    const firstDate = new Date(startAt);
    const days = Number(intervalDays);
    if (!Number.isFinite(firstDate.getTime()) || !Number.isInteger(days) || days < 1) return [];

    return selectedDrafts.map((draft, index) => ({
      ...draft,
      scheduledAt: new Date(firstDate.getTime() + index * days * 24 * 60 * 60 * 1000),
    }));
  }, [selectedDrafts, startAt, intervalDays]);

  const toggleDraft = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  };

  const toggleAll = () => {
    setSelectedIds((current) => current.length === drafts.length ? [] : drafts.map((draft) => draft.id));
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
    <div className="space-y-4">
      {drafts.length > 0 && (
        <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-5 w-5 text-primary" />Bulk Schedule</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pilih draft, lalu jadwalkan berurutan mulai dari waktu yang ditentukan.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
              <CheckSquare className="mr-2 h-4 w-4" />
              {selectedIds.length === drafts.length ? "Batalkan pilihan" : "Pilih semua draft"}
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
            <div className="rounded-lg border bg-muted/30 p-3">
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

          <Button type="button" onClick={scheduleSelected} disabled={isScheduling || selectedIds.length === 0}>
            {isScheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />}
            {isScheduling ? "Menjadwalkan..." : `Jadwalkan ${selectedIds.length || "draft terpilih"}`}
          </Button>
          <p className="text-xs text-muted-foreground">Waktu mengikuti zona waktu perangkat Anda.</p>
        </section>
      )}

      <div className="rounded-xl border bg-card">
        {drafts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Tidak ada draft yang belum dijadwalkan.</div>
        ) : (
          <div className="divide-y">
            {drafts.map((post) => (
              <div key={post.id} className="flex items-center gap-3 p-4 hover:bg-accent/50">
                <input
                  type="checkbox"
                  aria-label={`Pilih ${post.title || "draft"}`}
                  checked={selectedIds.includes(post.id)}
                  onChange={() => toggleDraft(post.id)}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">{post.title || "Untitled"}</h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {post.slug || "No slug"} • Dibuat {new Date(post.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button asChild type="button" variant="ghost" size="icon" title="Edit">
                    <Link href={`/admin/blog/${post.id}/edit`}><Edit className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild type="button" variant="ghost" size="icon" title="Preview">
                    <Link href={`/admin/blog/${post.id}/preview`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
