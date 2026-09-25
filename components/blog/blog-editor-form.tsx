"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BlogModuleBuilder } from "./module-builder";
import { ImageUploader } from "./image-uploader";
import { BlogSEOChecklist } from "./seo-checklist";
import { Save, Eye, Send, Loader2, Calendar, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Editor {
  id: string;
  name: string | null;
  email: string;
}

interface ArticleRecommendation {
  title: string;
  keyword: string;
  angle: string;
}

interface BlogEditorFormProps {
  editors: Editor[];
  currentUserId: string;
  postId?: string;
  contentPlanId?: string;
  initialGenerationTopic?: string;
  initialGenerationKeyword?: string;
  targetMinWords?: number;
  targetMaxWords?: number;
  initialPost?: Partial<{
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string;
    coverImageAlt: string;
    authorName: string;
    authorId: string;
    authorAvatar: string;
    reviewedBy: string;
    reviewedById: string;
    reviewedByTitle: string;
    metaDescription: string;
    metaKeywords: string;
    focusKeyword: string;
    scheduledAt: string;
    modules: Array<any>;
    isPublished: boolean;
  }>;
}

export function BlogEditorForm({ editors, currentUserId, postId, initialPost, contentPlanId, initialGenerationTopic = "", initialGenerationKeyword = "", targetMinWords, targetMaxWords }: BlogEditorFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [generationTopic, setGenerationTopic] = useState(initialGenerationTopic);
  const [generationKeyword, setGenerationKeyword] = useState(initialGenerationKeyword);
  const [improveInstruction, setImproveInstruction] = useState("");
  const [recommendations, setRecommendations] = useState<ArticleRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationCount, setRecommendationCount] = useState("5");

  const [formData, setFormData] = useState({
    title: initialPost?.title || "",
    slug: initialPost?.slug || "",
    summary: initialPost?.summary || "",
    content: initialPost?.content || "",
    coverImage: initialPost?.coverImage || "",
    coverImageAlt: initialPost?.coverImageAlt || initialPost?.focusKeyword || "",
    authorName: initialPost?.authorName || "",
    authorId: initialPost?.authorId || currentUserId,
    authorAvatar: initialPost?.authorAvatar || "",
    reviewedBy: initialPost?.reviewedBy || "",
    reviewedById: initialPost?.reviewedById || "",
    reviewedByTitle: initialPost?.reviewedByTitle || "",
    metaDescription: initialPost?.metaDescription || "",
    metaKeywords: initialPost?.metaKeywords || "",
    focusKeyword: initialPost?.focusKeyword || "",
    scheduledAt: initialPost?.scheduledAt || "",
  });

  const [modules, setModules] = useState<Array<any>>(initialPost?.modules || []);

  const syncContentPlan = async (linkedPostId: string, status: string) => {
    if (!contentPlanId) return;
    await fetch(`/api/admin/blog/strategy/${contentPlanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedPostId, status }),
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/blog/posts", {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(postId ? { id: postId } : {}),
           ...formData,
           contentPlanId,
           isPublished: false,
          scheduledAt: formData.scheduledAt || undefined,
          modules,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        await syncContentPlan(post.id, "ai_drafted");
        toast.success("Draft saved successfully!");
        if (postId) router.refresh();
        else router.push(`/admin/blog/${post.id}/edit`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to save draft");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch("/api/blog/posts", {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(postId ? { id: postId } : {}),
           ...formData,
           contentPlanId,
           isPublished: true,
          scheduledAt: formData.scheduledAt || undefined,
          modules,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        await syncContentPlan(post.id, "published");
        toast.success("Blog post published successfully!");
        if (postId) router.refresh();
        else router.push(`/admin/blog/${post.id}/edit`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to publish post");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish post");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedulePublish = async () => {
    if (!formData.scheduledAt) {
      toast.error("Please select a scheduled date and time");
      return;
    }

    const scheduledDate = new Date(formData.scheduledAt);
    const now = new Date();

    if (scheduledDate <= now) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/blog/posts", {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(postId ? { id: postId } : {}),
           ...formData,
           contentPlanId,
           scheduledAt: new Date(formData.scheduledAt).toISOString(),
          modules,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        await syncContentPlan(post.id, "scheduled");
        toast.success(`Post scheduled for ${scheduledDate.toLocaleString('id-ID')}`);
        if (postId) router.refresh();
        else router.push(`/admin/blog/drafts`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to schedule post");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule post");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (generationTopic.trim().length < 5) {
      toast.error("Masukkan topik artikel minimal 5 karakter.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: generationTopic, keyword: generationKeyword, planId: contentPlanId }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Artikel gagal dibuat.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        title: result.title,
        slug: result.slug,
        summary: result.summary,
        content: result.content,
        coverImageAlt: prev.coverImageAlt || result.focusKeyword,
        metaDescription: result.metaDescription,
        metaKeywords: result.metaKeywords,
        focusKeyword: result.focusKeyword,
      }));
      toast.success("Draft artikel berhasil dibuat. Periksa dan edit sebelum disimpan.");
    } catch (error) {
      console.error(error);
      toast.error("Artikel gagal dibuat.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const res = await fetch("/api/admin/blog/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(recommendationCount) }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Rekomendasi artikel gagal dibuat.");
        return;
      }
      setRecommendations(result.recommendations || []);
      toast.success(`${recommendationCount} rekomendasi artikel hari ini siap dipilih.`);
    } catch (error) {
      console.error(error);
      toast.error("Rekomendasi artikel gagal dibuat.");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleImproveArticle = async () => {
    if (improveInstruction.trim().length < 5) {
      toast.error("Tulis perintah perbaikan minimal 5 karakter.");
      return;
    }

    setIsImproving(true);
    try {
      const res = await fetch("/api/admin/blog/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, instruction: improveInstruction }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Artikel gagal diperbaiki.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        title: result.title,
        slug: result.slug,
        summary: result.summary,
        content: result.content,
        coverImageAlt: prev.coverImageAlt || result.focusKeyword,
        metaDescription: result.metaDescription,
        metaKeywords: result.metaKeywords,
        focusKeyword: result.focusKeyword,
      }));
      toast.success("Artikel diperbaiki di editor. Periksa sebelum menyimpan.");
    } catch (error) {
      console.error(error);
      toast.error("Artikel gagal diperbaiki.");
    } finally {
      setIsImproving(false);
    }
  };

  const handleSelectRecommendation = (recommendation: ArticleRecommendation) => {
    setGenerationTopic(recommendation.title);
    setGenerationKeyword(recommendation.keyword);
    toast.success("Topik dipilih. Klik Generate Draft untuk membuat artikelnya.");
  };

  const selectedAuthor = editors.find((e) => e.id === formData.authorId);
  const selectedReviewer = editors.find((e) => e.id === formData.reviewedById);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Generate dengan AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900/60 dark:bg-violet-950/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-violet-950 dark:text-violet-100">Rekomendasi artikel hari ini</p>
                  <p className="text-xs text-violet-700 dark:text-violet-300">Pilih satu ide untuk mengisi topik dan keyword secara otomatis.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Select value={recommendationCount} onValueChange={(value) => setRecommendationCount(value || "5")} disabled={isLoadingRecommendations || isGenerating}>
                    <SelectTrigger className="w-[110px] bg-white dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((count) => (
                        <SelectItem key={count} value={String(count)}>{count} Ide</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadRecommendations}
                    disabled={isLoadingRecommendations || isGenerating}
                  >
                    {isLoadingRecommendations ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {isLoadingRecommendations ? "Mencari ide..." : `Tampilkan ${recommendationCount} Ide`}
                  </Button>
                </div>
              </div>
              {recommendations.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {recommendations.map((recommendation, index) => (
                    <button
                      key={`${recommendation.title}-${index}`}
                      type="button"
                      onClick={() => handleSelectRecommendation(recommendation)}
                      className="rounded-lg border border-violet-200 bg-white p-3 text-left transition-colors hover:border-violet-500 hover:bg-violet-50 dark:border-violet-900/60 dark:bg-slate-900 dark:hover:bg-violet-950/30"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{index + 1}. {recommendation.title}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Keyword: {recommendation.keyword} · {recommendation.angle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="generation-topic">Topik Artikel</Label>
              <Input
                id="generation-topic"
                value={generationTopic}
                onChange={(e) => setGenerationTopic(e.target.value)}
                placeholder="Contoh: Cara mengamankan kunci motor dari kehilangan"
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generation-keyword">Keyword Utama (Opsional)</Label>
              <Input
                id="generation-keyword"
                value={generationKeyword}
                onChange={(e) => setGenerationKeyword(e.target.value)}
                placeholder="Contoh: tag kunci motor"
                disabled={isGenerating}
              />
            </div>
            <Button
              type="button"
              onClick={handleGenerateArticle}
              disabled={isGenerating || isSaving || isPublishing}
              className="w-full"
              variant="secondary"
            >
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isGenerating ? "Membuat artikel..." : "Generate Draft"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Hasil hanya mengisi editor. Artikel tidak dipublikasikan otomatis.
            </p>
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div>
                <p className="font-medium text-amber-950 dark:text-amber-100">Perbaiki artikel dengan AI</p>
                <p className="text-xs text-amber-800 dark:text-amber-300">Tulis perubahan yang Anda inginkan. Hasil hanya menggantikan isi editor dan belum disimpan.</p>
              </div>
              <Textarea
                value={improveInstruction}
                onChange={(event) => setImproveInstruction(event.target.value)}
                placeholder="Contoh: Buat pembukaan lebih menarik, pendekkan paragraf, dan tambahkan soft-selling Free Pass secara natural."
                rows={3}
                disabled={isImproving}
              />
              <Button
                type="button"
                onClick={handleImproveArticle}
                disabled={isImproving || isGenerating || isSaving || isPublishing || !formData.content.trim()}
                className="w-full bg-amber-600 text-white hover:bg-amber-700"
              >
                {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isImproving ? "Memperbaiki artikel..." : "Perbaiki dengan AI"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title..."
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
               <Label htmlFor="slug">Recommended Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-slug"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary for meta description and social sharing..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{formData.summary.length}/160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your article content in Markdown..."
                rows={20}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <BlogModuleBuilder modules={modules} onModulesChange={setModules} />
      </div>

      <div className="space-y-6">
        <BlogSEOChecklist
          title={formData.title}
          slug={formData.slug}
          summary={formData.summary}
          content={formData.content}
          metaDescription={formData.metaDescription}
          focusKeyword={formData.focusKeyword}
          coverImage={formData.coverImage}
          targetMinWords={targetMinWords}
          targetMaxWords={targetMaxWords}
        />

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleSaveDraft}
              disabled={isSaving || isPublishing}
              variant="outline"
              className="w-full"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              className="w-full"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Publish Now
            </Button>
            <Button
              onClick={handleSchedulePublish}
              disabled={isSaving || isPublishing || !formData.scheduledAt}
              variant="secondary"
              className="w-full"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              Schedule Publish
            </Button>
            <Button
              onClick={() => {
                if (postId) {
                  window.open(`/admin/blog/${postId}/preview`, "_blank");
                  return;
                }
                toast.info("Simpan draft terlebih dahulu untuk membuka preview.");
              }}
              disabled={!postId}
              variant="ghost"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
              <ImageUploader
                value={formData.coverImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                altText={formData.coverImageAlt}
                autoAltText={formData.focusKeyword || formData.title}
                onAltTextChange={(altText) => setFormData((prev) => ({ ...prev, coverImageAlt: altText }))}
              />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Author & Reviewer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Author</Label>
              <Select value={formData.authorId} onValueChange={(value) => setFormData((prev) => ({ ...prev, authorId: value || currentUserId }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select author">
                    {selectedAuthor?.name || selectedAuthor?.email}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {editors.map((editor) => (
                    <SelectItem key={editor.id} value={editor.id}>
                      {editor.name || editor.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={formData.authorName}
                onChange={(e) => setFormData((prev) => ({ ...prev, authorName: e.target.value }))}
                placeholder="Display name (if different)"
              />
            </div>

            <div className="space-y-2">
              <Label>Reviewer (E-E-A-T)</Label>
              <Select
                value={formData.reviewedById || ""}
                onValueChange={(value) => {
                  const reviewer = editors.find((e) => e.id === value);
                  setFormData((prev) => ({
                    ...prev,
                    reviewedById: value || "",
                    reviewedBy: reviewer?.name || "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reviewer">
                    {selectedReviewer?.name || "None"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {editors.map((editor) => (
                    <SelectItem key={editor.id} value={editor.id}>
                      {editor.name || editor.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={formData.reviewedByTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, reviewedByTitle: e.target.value }))}
                placeholder="Job title (e.g., Security Expert)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
               <Label htmlFor="metaDescription">Recommended Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="SEO meta description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={formData.metaKeywords}
                onChange={(e) => setFormData((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusKeyword">Focus Keyword</Label>
              <Input
                id="focusKeyword"
                value={formData.focusKeyword}
                onChange={(e) => setFormData((prev) => ({ ...prev, focusKeyword: e.target.value }))}
                placeholder="Primary target keyword"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Schedule Publish (Optional)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to publish immediately, or select a future date/time to schedule.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
