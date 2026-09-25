"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, ListPlus, Plus, RefreshCw, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Cluster = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primaryKeyword: string | null;
  targetArticles: number;
};

type Plan = {
  id: string;
  clusterId: string;
  parentPlanId: string | null;
  linkedPostId: string | null;
  title: string;
  focusKeyword: string;
  articleType: string;
  searchIntent: string;
  priority: string;
  status: string;
  brief: string | null;
  targetPublishDate: string | null;
};

interface Props {
  initialClusters: (Cluster & { createdAt: string; updatedAt: string })[];
  initialPlans: (Plan & { createdAt: string; updatedAt: string })[];
}

const statusLabels: Record<string, string> = {
  planned: "Planned",
  brief_ready: "Brief Ready",
  ai_drafted: "AI Drafted",
  review: "Human Review",
  seo_ready: "SEO Ready",
  scheduled: "Scheduled",
  published: "Published",
};

export function ContentStrategyClient({ initialClusters, initialPlans }: Props) {
  const [clusters, setClusters] = useState(initialClusters);
  const [plans, setPlans] = useState(initialPlans);
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showClusterForm, setShowClusterForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [clusterForm, setClusterForm] = useState({ name: "", slug: "", primaryKeyword: "", description: "" });
  const [planForm, setPlanForm] = useState({ clusterId: "", title: "", focusKeyword: "", articleType: "supporting", searchIntent: "informational", priority: "medium", brief: "" });

  const visiblePlans = useMemo(() => plans.filter((plan) => (
    (selectedCluster === "all" || plan.clusterId === selectedCluster) &&
    (statusFilter === "all" || plan.status === statusFilter)
  )), [plans, selectedCluster, statusFilter]);
  const published = plans.filter((plan) => plan.status === "published" || plan.linkedPostId).length;
  const inProgress = plans.filter((plan) => !["planned", "published"].includes(plan.status) && !plan.linkedPostId).length;

  const refresh = async () => {
    const response = await fetch("/api/admin/blog/strategy");
    if (!response.ok) return;
    const data = await response.json();
    setClusters(data.clusters);
    setPlans(data.plans);
  };

  const seedStrategy = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/admin/blog/strategy/seed", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Seed gagal dibuat");
      await refresh();
      toast.success(`${data.plans} rencana artikel berhasil dibuat.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Seed gagal dibuat.");
    } finally {
      setIsSeeding(false);
    }
  };

  const createCluster = async () => {
    const response = await fetch("/api/admin/blog/strategy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cluster", ...clusterForm }),
    });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Cluster gagal dibuat.");
    setClusters((current) => [...current, data]);
    setClusterForm({ name: "", slug: "", primaryKeyword: "", description: "" });
    setShowClusterForm(false);
    toast.success("Cluster berhasil dibuat.");
  };

  const createPlan = async () => {
    const response = await fetch("/api/admin/blog/strategy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "plan", ...planForm }),
    });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Rencana gagal dibuat.");
    setPlans((current) => [...current, data]);
    setPlanForm({ clusterId: "", title: "", focusKeyword: "", articleType: "supporting", searchIntent: "informational", priority: "medium", brief: "" });
    setShowPlanForm(false);
    toast.success("Rencana artikel berhasil dibuat.");
  };

  const updateStatus = async (id: string, status: string) => {
    const response = await fetch(`/api/admin/blog/strategy/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return toast.error("Status gagal diperbarui.");
    const data = await response.json();
    setPlans((current) => current.map((plan) => plan.id === id ? { ...plan, ...data } : plan));
  };

  const clusterName = (clusterId: string) => clusters.find((cluster) => cluster.id === clusterId)?.name || "Tanpa cluster";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Strategy</h1>
          <p className="text-muted-foreground">Kelola topic cluster, pillar, supporting article, dan target publikasi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={seedStrategy} disabled={isSeeding || clusters.length > 0}>
            <Target className="mr-2 h-4 w-4" />
            {isSeeding ? "Menyiapkan..." : "Seed 60 Artikel"}
          </Button>
          <Button variant="outline" onClick={() => setShowClusterForm((value) => !value)}><Plus className="mr-2 h-4 w-4" />Cluster</Button>
          <Button onClick={() => setShowPlanForm((value) => !value)}><ListPlus className="mr-2 h-4 w-4" />Rencana Artikel</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Target Artikel", plans.length, "dari 60 rencana"],
          ["Published", published, "artikel selesai"],
          ["Dalam Proses", inProgress, "perlu ditindaklanjuti"],
          ["Topic Cluster", clusters.length, "cluster aktif"],
        ].map(([label, value, detail]) => (
          <div key={String(label)} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>

      {showClusterForm && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Tambah Topic Cluster</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Nama cluster" value={clusterForm.name} onChange={(e) => setClusterForm({ ...clusterForm, name: e.target.value })} />
            <Input placeholder="slug-cluster" value={clusterForm.slug} onChange={(e) => setClusterForm({ ...clusterForm, slug: e.target.value })} />
            <Input placeholder="Keyword utama" value={clusterForm.primaryKeyword} onChange={(e) => setClusterForm({ ...clusterForm, primaryKeyword: e.target.value })} />
            <Input placeholder="Deskripsi singkat" value={clusterForm.description} onChange={(e) => setClusterForm({ ...clusterForm, description: e.target.value })} />
          </div>
          <Button onClick={createCluster}>Simpan Cluster</Button>
        </div>
      )}

      {showPlanForm && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Tambah Rencana Artikel</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={planForm.clusterId} onValueChange={(value) => setPlanForm({ ...planForm, clusterId: value || "" })}>
              <SelectTrigger><SelectValue placeholder="Pilih cluster" /></SelectTrigger>
              <SelectContent>{clusters.map((cluster) => <SelectItem key={cluster.id} value={cluster.id}>{cluster.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Judul artikel" value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} />
            <Input placeholder="Focus keyword" value={planForm.focusKeyword} onChange={(e) => setPlanForm({ ...planForm, focusKeyword: e.target.value })} />
            <Select value={planForm.articleType} onValueChange={(value) => setPlanForm({ ...planForm, articleType: value || "supporting" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="pillar">Pillar</SelectItem><SelectItem value="supporting">Supporting</SelectItem><SelectItem value="commercial">Commercial</SelectItem></SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Brief artikel" value={planForm.brief} onChange={(e) => setPlanForm({ ...planForm, brief: e.target.value })} />
          <Button onClick={createPlan}>Simpan Rencana</Button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {clusters.map((cluster) => {
          const count = plans.filter((plan) => plan.clusterId === cluster.id).length;
          const done = plans.filter((plan) => plan.clusterId === cluster.id && (plan.status === "published" || plan.linkedPostId)).length;
          return <button key={cluster.id} onClick={() => setSelectedCluster(cluster.id)} className={`rounded-xl border p-4 text-left transition ${selectedCluster === cluster.id ? "border-primary bg-primary/5" : "bg-card hover:bg-accent/40"}`}><div className="flex items-center justify-between"><span className="font-semibold">{cluster.name}</span><span className="text-xs text-muted-foreground">{done}/{count}</span></div><p className="mt-1 text-xs text-muted-foreground">{cluster.primaryKeyword || "Belum ada keyword utama"}</p><div className="mt-3 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${count ? Math.round(done / count * 100) : 0}%` }} /></div></button>;
        })}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-semibold">Editorial Roadmap</h2><p className="text-sm text-muted-foreground">Pilih rencana untuk dilanjutkan ke editor artikel.</p></div>
          <div className="flex gap-2">
            <Select value={selectedCluster} onValueChange={(value) => setSelectedCluster(value || "all")}><SelectTrigger className="w-[190px]"><SelectValue placeholder="Semua cluster" /></SelectTrigger><SelectContent><SelectItem value="all">Semua cluster</SelectItem>{clusters.map((cluster) => <SelectItem key={cluster.id} value={cluster.id}>{cluster.name}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Semua status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua status</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
            <Button variant="ghost" size="icon" onClick={refresh} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="divide-y">
          {visiblePlans.map((plan) => (
            <div key={plan.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className={`rounded px-2 py-0.5 text-[11px] font-medium ${plan.articleType === "pillar" ? "bg-violet-500/10 text-violet-700" : plan.articleType === "commercial" ? "bg-emerald-500/10 text-emerald-700" : "bg-blue-500/10 text-blue-700"}`}>{plan.articleType}</span><span className="text-xs text-muted-foreground">{clusterName(plan.clusterId)}</span></div><h3 className="font-medium">{plan.title}</h3><p className="text-sm text-muted-foreground">Keyword: <strong>{plan.focusKeyword}</strong>{plan.parentPlanId ? " · Supporting article" : ""}</p></div>
              <div className="flex flex-wrap items-center gap-2"><Select value={plan.status} onValueChange={(value) => updateStatus(plan.id, value || plan.status)}><SelectTrigger className="w-[145px]"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>{plan.status === "planned" && <Link href={`/admin/blog/new?planId=${plan.id}`}><Button size="sm"><Sparkles className="mr-1 h-3.5 w-3.5" />Generate Draft</Button></Link>}{plan.targetPublishDate && <span className="text-xs text-muted-foreground"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />{new Date(plan.targetPublishDate).toLocaleDateString("id-ID")}</span>}</div>
            </div>
          ))}
          {visiblePlans.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Belum ada rencana pada filter ini.</div>}
        </div>
      </div>
    </div>
  );
}
