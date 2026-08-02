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
import { Save, Eye, Send, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Editor {
  id: string;
  name: string | null;
  email: string;
}

interface BlogEditorFormProps {
  editors: Editor[];
  currentUserId: string;
}

export function BlogEditorForm({ editors, currentUserId }: BlogEditorFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: "",
    authorName: "",
    authorId: currentUserId,
    authorAvatar: "",
    reviewedBy: "",
    reviewedById: "",
    reviewedByTitle: "",
    metaDescription: "",
    metaKeywords: "",
    focusKeyword: "",
    scheduledAt: "",
  });

  const [modules, setModules] = useState<Array<any>>([]);

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isPublished: false,
          modules,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success("Draft saved successfully!");
        router.push(`/admin/blog/${post.id}/edit`);
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledAt: new Date().toISOString(),
          modules,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success("Blog post published successfully!");
        router.push(`/admin/blog/${post.id}/edit`);
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledAt: formData.scheduledAt,
          modules,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success(`Post scheduled for ${scheduledDate.toLocaleString('id-ID')}`);
        router.push(`/admin/blog/drafts`);
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

  const selectedAuthor = editors.find((e) => e.id === formData.authorId);
  const selectedReviewer = editors.find((e) => e.id === formData.reviewedById);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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
              <Label htmlFor="slug">Slug</Label>
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
                const slug = formData.slug || generateSlug(formData.title);
                window.open(`/blog/${slug}`, "_blank");
              }}
              disabled={!formData.slug}
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
              <Select value={formData.authorId} onValueChange={(value) => setFormData((prev) => ({ ...prev, authorId: value }))}>
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
                    reviewedById: value,
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
              <Label htmlFor="metaDescription">Meta Description</Label>
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
