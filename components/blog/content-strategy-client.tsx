"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, ListPlus, Pencil, Plus, RefreshCw, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRAND_PILLARS, getWordTarget } from "@/lib/blog-content-strategy";

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
  brandPillar: string | null;
  searchIntent: string;
  priority: string;
  status: string;
  brief: string | null;
  targetMinWords: number;
  targetMaxWords: number;
  targetPublishDate: string | null;
};

type AIPlanSuggestion = {
  suggestionId: string;
  title: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  articleType: string;
  searchIntent: string;
  brandPillar: string;
  brief: string;
  cta: string;
  targetMinWords: number;
  targetMaxWords: number;
  isDuplicate: boolean;
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
  const [articleTypeFilter, setArticleTypeFilter] = useState("all");
  const [brandPillarFilter, setBrandPillarFilter] = useState("all");
  const [showClusterForm, setShowClusterForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showAIPlanForm, setShowAIPlanForm] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [isSavingAIPlans, setIsSavingAIPlans] = useState(false);
  const [aiClusterId, setAIClusterId] = useState(initialClusters[0]?.id || "");
  const [aiParentPlanId, setAIParentPlanId] = useState(
    initialPlans.find((plan) => plan.clusterId === initialClusters[0]?.id && plan.articleType === "pillar")?.id || "none",
  );
  const [aiSuggestionCount, setAISuggestionCount] = useState("5");
  const [aiSuggestions, setAISuggestions] = useState<AIPlanSuggestion[]>([]);
  const [selectedAISuggestionIds, setSelectedAISuggestionIds] = useState<string[]>([]);
  const [clusterForm, setClusterForm] = useState({ name: "", slug: "", primaryKeyword: "", description: "" });
  const [planForm, setPlanForm] = useState({ clusterId: "", title: "", focusKeyword: "", articleType: "supporting", brandPillar: "", targetMinWords: 800, targetMaxWords: 1500, searchIntent: "informational", priority: "medium", brief: "" });

  const visiblePlans = useMemo(() => plans.filter((plan) => (
    (selectedCluster === "all" || plan.clusterId === selectedCluster) &&
    (statusFilter === "all" || plan.status === statusFilter) &&
    (articleTypeFilter === "all" || plan.articleType === articleTypeFilter) &&
    (brandPillarFilter === "all" || plan.brandPillar === brandPillarFilter)
  )), [plans, selectedCluster, statusFilter, articleTypeFilter, brandPillarFilter]);
  const AIParentPillars = plans.filter((plan) => plan.clusterId === aiClusterId && plan.articleType === "pillar");
  const selectedAISuggestions = aiSuggestions.filter((suggestion) => selectedAISuggestionIds.includes(suggestion.suggestionId) && !suggestion.isDuplicate);
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
      toast.success(`Seed selesai: ${data.plansAdded} artikel baru, ${data.plansLabeled} artikel diperbarui dengan Pilar Brand. Artikel lama tetap dipertahankan.`);
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
    if (!aiClusterId) setAIClusterId(data.id);
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
    setPlanForm({ clusterId: "", title: "", focusKeyword: "", articleType: "supporting", brandPillar: "", targetMinWords: 800, targetMaxWords: 1500, searchIntent: "informational", priority: "medium", brief: "" });
    setShowPlanForm(false);
    toast.success("Rencana artikel berhasil dibuat.");
  };

  const generateAIPlans = async () => {
    if (!aiClusterId) return toast.error("Pilih cluster terlebih dahulu.");
    setIsGeneratingPlans(true);
    setAISuggestions([]);
    setSelectedAISuggestionIds([]);
    try {
      const response = await fetch("/api/admin/blog/strategy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clusterId: aiClusterId,
          count: Number(aiSuggestionCount),
          parentPlanId: aiParentPlanId === "none" ? null : aiParentPlanId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Usulan rencana gagal dibuat.");
      const suggestions = (data.suggestions || []).map((suggestion: Omit<AIPlanSuggestion, "suggestionId">, index: number) => ({
        ...suggestion,
        suggestionId: `${Date.now()}-${index}`,
      })) as AIPlanSuggestion[];
      setAISuggestions(suggestions);
      toast.success(`${suggestions.length} usulan dibuat. Tinjau dan pilih yang ingin ditambahkan.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Usulan rencana gagal dibuat.");
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  const saveSelectedAIPlans = async () => {
    if (selectedAISuggestions.length === 0) return toast.error("Pilih minimal satu usulan yang tidak duplikat.");
    setIsSavingAIPlans(true);
    try {
      const response = await fetch("/api/admin/blog/strategy/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clusterId: aiClusterId,
          parentPlanId: aiParentPlanId === "none" ? null : aiParentPlanId,
          suggestions: selectedAISuggestions.map(({ suggestionId: _suggestionId, targetMinWords: _targetMinWords, targetMaxWords: _targetMaxWords, isDuplicate: _isDuplicate, ...suggestion }) => suggestion),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Usulan gagal disimpan.");
      if (data.created?.length) setPlans((current) => [...current, ...data.created]);
      await refresh();
      setAISuggestions([]);
      setSelectedAISuggestionIds([]);
      toast.success(`${data.created?.length || 0} rencana ditambahkan${data.skippedDuplicates ? `; ${data.skippedDuplicates} duplikat dilewati` : ""}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Usulan gagal disimpan.");
    } finally {
      setIsSavingAIPlans(false);
    }
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
          <Button variant="outline" onClick={seedStrategy} disabled={isSeeding}>
            <Target className="mr-2 h-4 w-4" />
            {isSeeding ? "Menyinkronkan..." : "Seed / Sinkronkan 60 Artikel"}
          </Button>
          <Button variant="outline" onClick={() => setShowAIPlanForm((value) => !value)}><Sparkles className="mr-2 h-4 w-4" />Generate Rencana AI</Button>
          <Button variant="outline" onClick={() => setShowClusterForm((value) => !value)}><Plus className="mr-2 h-4 w-4" />Cluster</Button>
          <Button onClick={() => setShowPlanForm((value) => !value)}><ListPlus className="mr-2 h-4 w-4" />Rencana Artikel</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Target Artikel", plans.length, "rencana di roadmap"],
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

      {showAIPlanForm && (
        <div className="space-y-4 rounded-xl border border-violet-200 bg-violet-50/40 p-5 dark:border-violet-900/60 dark:bg-violet-950/10">
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 text-violet-600" />Generate Rencana Artikel dengan AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">AI membaca cluster dan rencana yang ada. Usulan baru tidak disimpan sampai Anda memilihnya.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={aiClusterId} onValueChange={(value) => {
              const nextClusterId = value || "";
              setAIClusterId(nextClusterId);
              setAIParentPlanId(plans.find((plan) => plan.clusterId === nextClusterId && plan.articleType === "pillar")?.id || "none");
              setAISuggestions([]);
              setSelectedAISuggestionIds([]);
            }}>
              <SelectTrigger><SelectValue placeholder="Pilih cluster" /></SelectTrigger>
              <SelectContent>{clusters.map((cluster) => <SelectItem key={cluster.id} value={cluster.id}>{cluster.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={aiParentPlanId} onValueChange={(value) => setAIParentPlanId(value || "none")}>
              <SelectTrigger><SelectValue placeholder="Pillar induk (opsional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Pilih otomatis / tanpa pillar induk</SelectItem>
                {AIParentPillars.map((pillar) => <SelectItem key={pillar.id} value={pillar.id}>{pillar.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={aiSuggestionCount} onValueChange={(value) => setAISuggestionCount(value || "5")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="3">3 usulan</SelectItem><SelectItem value="4">4 usulan</SelectItem><SelectItem value="5">5 usulan</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={generateAIPlans} disabled={isGeneratingPlans || !aiClusterId}>
              {isGeneratingPlans ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isGeneratingPlans ? "Menganalisis cluster..." : "Buat Usulan"}
            </Button>
            {aiSuggestions.length > 0 && <Button type="button" variant="outline" onClick={() => { setAISuggestions([]); setSelectedAISuggestionIds([]); }}>Hapus Pratinjau</Button>}
          </div>

          {aiSuggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Tinjau usulan, lalu pilih yang akan masuk ke roadmap.</p>
              {aiSuggestions.map((suggestion) => {
                const brandPillarLabel = BRAND_PILLARS.find((pillar) => pillar.value === suggestion.brandPillar)?.label || suggestion.brandPillar;
                const selected = selectedAISuggestionIds.includes(suggestion.suggestionId);
                return (
                  <label key={suggestion.suggestionId} className={`block rounded-lg border bg-card p-4 ${suggestion.isDuplicate ? "opacity-60" : "cursor-pointer hover:border-primary/50"}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-primary"
                        checked={selected}
                        disabled={suggestion.isDuplicate}
                        onChange={() => setSelectedAISuggestionIds((current) => selected ? current.filter((id) => id !== suggestion.suggestionId) : [...current, suggestion.suggestionId])}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium">{suggestion.articleType}</span>
                          <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700">{brandPillarLabel}</span>
                          {suggestion.isDuplicate && <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">Mirip dengan rencana yang sudah ada</span>}
                        </div>
                        <p className="font-semibold">{suggestion.title}</p>
                        <p className="text-sm text-muted-foreground">Focus keyword: <strong>{suggestion.focusKeyword}</strong>{suggestion.secondaryKeywords.length > 0 && ` · Sekunder: ${suggestion.secondaryKeywords.join(", ")}`}</p>
                        <p className="text-sm">{suggestion.brief}</p>
                        <p className="text-xs text-muted-foreground">Search intent: {suggestion.searchIntent} · Target {suggestion.targetMinWords.toLocaleString("id-ID")}–{suggestion.targetMaxWords.toLocaleString("id-ID")} kata · CTA: {suggestion.cta}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={saveSelectedAIPlans} disabled={isSavingAIPlans || selectedAISuggestions.length === 0}>
                  {isSavingAIPlans ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  {isSavingAIPlans ? "Menyimpan..." : `Tambahkan ${selectedAISuggestions.length} ke Roadmap`}
                </Button>
                <span className="text-xs text-muted-foreground">Usulan duplikat tidak dapat dipilih.</span>
              </div>
            </div>
          )}
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
            <Select value={planForm.articleType} onValueChange={(value) => { const articleType = value || "supporting"; const target = getWordTarget(articleType); setPlanForm({ ...planForm, articleType, targetMinWords: target.min, targetMaxWords: target.max }); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="pillar">Pillar</SelectItem><SelectItem value="supporting">Supporting</SelectItem><SelectItem value="commercial">Commercial</SelectItem></SelectContent>
            </Select>
            <Select value={planForm.brandPillar || "none"} onValueChange={(value) => setPlanForm({ ...planForm, brandPillar: value === "none" ? "" : value || "" })}>
              <SelectTrigger><SelectValue placeholder="Pilih pilar brand (opsional)" /></SelectTrigger>
              <SelectContent><SelectItem value="none">Tanpa pilar brand</SelectItem>{BRAND_PILLARS.map((pillar) => <SelectItem key={pillar.value} value={pillar.value}>{pillar.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" min={100} placeholder="Minimum kata" value={planForm.targetMinWords} onChange={(e) => setPlanForm({ ...planForm, targetMinWords: Number(e.target.value) })} />
            <Input type="number" min={100} placeholder="Maksimum kata" value={planForm.targetMaxWords} onChange={(e) => setPlanForm({ ...planForm, targetMaxWords: Number(e.target.value) })} />
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
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCluster} onValueChange={(value) => setSelectedCluster(value || "all")}><SelectTrigger className="w-[190px]"><SelectValue placeholder="Semua cluster" /></SelectTrigger><SelectContent><SelectItem value="all">Semua cluster</SelectItem>{clusters.map((cluster) => <SelectItem key={cluster.id} value={cluster.id}>{cluster.name}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Semua status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua status</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
            <Select value={articleTypeFilter} onValueChange={(value) => setArticleTypeFilter(value || "all")}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Semua jenis" /></SelectTrigger><SelectContent><SelectItem value="all">Semua jenis</SelectItem><SelectItem value="pillar">Pillar</SelectItem><SelectItem value="supporting">Supporting</SelectItem><SelectItem value="commercial">Commercial</SelectItem></SelectContent></Select>
            <Select value={brandPillarFilter} onValueChange={(value) => setBrandPillarFilter(value || "all")}><SelectTrigger className="w-[220px]"><SelectValue placeholder="Semua pilar brand" /></SelectTrigger><SelectContent><SelectItem value="all">Semua pilar brand</SelectItem>{BRAND_PILLARS.map((pillar) => <SelectItem key={pillar.value} value={pillar.value}>{pillar.label}</SelectItem>)}</SelectContent></Select>
            <Button variant="ghost" size="icon" onClick={refresh} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="divide-y">
          {visiblePlans.map((plan) => (
            <div key={plan.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className={`rounded px-2 py-0.5 text-[11px] font-medium ${plan.articleType === "pillar" ? "bg-violet-500/10 text-violet-700" : plan.articleType === "commercial" ? "bg-emerald-500/10 text-emerald-700" : "bg-blue-500/10 text-blue-700"}`}>{plan.articleType}</span><span className="text-xs text-muted-foreground">{clusterName(plan.clusterId)}</span>{plan.brandPillar && <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-700">{BRAND_PILLARS.find((pillar) => pillar.value === plan.brandPillar)?.label || plan.brandPillar}</span>}</div><h3 className="font-medium">{plan.title}</h3><p className="text-sm text-muted-foreground">Keyword: <strong>{plan.focusKeyword}</strong>{plan.parentPlanId ? " · Supporting article" : ""} · Target: {plan.targetMinWords.toLocaleString("id-ID")}–{plan.targetMaxWords.toLocaleString("id-ID")} kata</p></div>
              <div className="flex flex-wrap items-center gap-2"><Select value={plan.status} onValueChange={(value) => updateStatus(plan.id, value || plan.status)}><SelectTrigger className="w-[145px]"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>{plan.linkedPostId && <Link href={`/admin/blog/${plan.linkedPostId}/edit`}><Button size="sm" variant="outline"><Pencil className="mr-1 h-3.5 w-3.5" />Edit Artikel</Button></Link>}{plan.status === "ai_drafted" && !plan.linkedPostId && <Link href={`/admin/blog/new?planId=${plan.id}`}><Button size="sm" variant="outline"><Pencil className="mr-1 h-3.5 w-3.5" />Lanjutkan ke Editor</Button></Link>}{plan.status === "planned" && <Link href={`/admin/blog/new?planId=${plan.id}`}><Button size="sm"><Sparkles className="mr-1 h-3.5 w-3.5" />Generate Draft</Button></Link>}{plan.targetPublishDate && <span className="text-xs text-muted-foreground"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />{new Date(plan.targetPublishDate).toLocaleDateString("id-ID")}</span>}</div>
            </div>
          ))}
          {visiblePlans.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Belum ada rencana pada filter ini.</div>}
        </div>
      </div>
    </div>
  );
}
