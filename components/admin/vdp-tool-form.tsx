"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Package, Download, Info, AlertCircle, Eye, Trash2, Printer, Check, X, FileDown, QrCode } from "lucide-react";
import QRCode from "qrcode";
import QRCodeStyling from "qr-code-styling";
import { getPremiumQRColors } from "@/lib/premium-qr-generator";

interface Tag {
  id: string;
  slug: string;
  name: string;
  ownerId: string | null;
  contactWhatsapp: string | null;
  customMessage: string | null;
  rewardNote: string | null;
  status: string;
  tier: string;
  productType: string;
  bundleType: string | null;
  createdAt: string;
  stickerShape: string | null;
  stickerSize: string | null;
}

interface TagStats {
  total: number;
  claimed: number;
  unclaimed: number;
}

interface VDPToolFormProps {
  adminId: string;
}

export function VDPToolForm({ adminId }: VDPToolFormProps) {
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [generatedTags, setGeneratedTags] = useState<any[]>([]);

  // Bulk generation form
  const [formData, setFormData] = useState({
    batchName: "",
    quantity: 100,
    materialType: "sticker" as "sticker" | "acrylic",
    productType: "standard" as "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat",
    paperSize: "a4" as "a4" | "a3",
    stickerShape: "circle" as "circle" | "square" | "rectangle",
    stickerSize: "medium" as "small" | "medium" | "large",
  });

  // Individual tag creation form
  const [singleForm, setSingleForm] = useState({
    name: "",
    customMessage: "",
    rewardNote: "",
    contactWhatsapp: "",
    qrPreview: "",
  });

  // Tags management
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<TagStats>({ total: 0, claimed: 0, unclaimed: 0 });
  const [filter, setFilter] = useState<"all" | "claimed" | "unclaimed">("all");
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  // Preview modal
  const [previewTag, setPreviewTag] = useState<Tag | null>(null);
  const [previewQrData, setPreviewQrData] = useState<string | null>(null);

  // Print preview modal
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printPreviewQrCodes, setPrintPreviewQrCodes] = useState<Array<{
    tag: Tag;
    qrDataUrl: string;
  }>>([]);

  // Fetch tags on mount and filter change
  useEffect(() => {
    fetchTags();
  }, [filter]);

  // Generate QR preview for single tag
  useEffect(() => {
    if (singleForm.name) {
      const slug = singleForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      generateQRPreview(slug);
    } else {
      setSingleForm({ ...singleForm, qrPreview: "" });
    }
  }, [singleForm.name]);

  const generateQRPreview = async (slug: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const qrUrl = `${baseUrl}/p/${slug}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setSingleForm({ ...singleForm, qrPreview: qrDataUrl });
    } catch (error) {
      console.error("Error generating QR preview:", error);
    }
  };

  /**
   * Generate premium QR code using qr-code-styling for acrylic/premium tier
   */
  const generatePremiumQR = async (
    url: string,
    productType: string,
    size: number = 600
  ): Promise<string> => {
    try {
      const colors = getPremiumQRColors(productType !== "standard" ? productType : "standard");

      const qrCode = new QRCodeStyling({
        width: size,
        height: size,
        data: url,
        margin: 4,
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        dotsOptions: {
          color: colors.dots,
          type: "dots",
        },
        backgroundOptions: {
          color: colors.background,
        },
        cornersSquareOptions: {
          color: colors.cornerSquare,
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: colors.cornerDot,
          type: "dot",
        },
      });

      // Convert QR to base64 using canvas
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        qrCode.apply(canvas).then(() => {
          resolve(canvas.toDataURL('image/png'));
        }).catch(reject);
      });
    } catch (error) {
      console.error("Error generating premium QR:", error);
      // Fallback to standard QR
      return QRCode.toDataURL(url, {
        width: size,
        margin: 4,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
  };

  /**
   * Generate standard QR code for sticker/free tier
   */
  const generateStandardQR = async (
    url: string,
    size: number = 600
  ): Promise<string> => {
    return QRCode.toDataURL(url, {
      width: size,
      margin: 4,
      color: { dark: "#000000", light: "#ffffff" },
    });
  };

  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const response = await fetch(`/admin/api/vdp/generate?filter=${filter}`);
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setTags(data.tags);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setProgress({ current: 0, total: formData.quantity });
    setDownloadUrl(null);
    setGeneratedTags([]);

    try {
      const response = await fetch("/admin/api/vdp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          adminId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate batch");

      const data = await response.json();

      setProgress({ current: data.quantity, total: data.quantity });
      setDownloadUrl(data.downloadUrl);
      setGeneratedTags(data.tags);

      // Reset form
      setFormData({
        batchName: "",
        quantity: 100,
        materialType: "sticker",
        productType: "standard",
        paperSize: "a4",
        stickerShape: "circle",
        stickerSize: "medium",
      });

      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error("Error generating batch:", error);
      alert("Failed to generate batch. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSingleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.name) return;

    try {
      const slug = singleForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Math.random().toString(36).substring(7);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const response = await fetch("/admin/api/vdp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName: singleForm.name,
          quantity: 1,
          materialType: "acrylic",
          productType: "standard",
          paperSize: "a4",
          stickerShape: "circle",
          stickerSize: "medium",
          adminId,
          singleTag: {
            slug,
            name: singleForm.name,
            contactWhatsapp: singleForm.contactWhatsapp || null,
            customMessage: singleForm.customMessage || null,
            rewardNote: singleForm.rewardNote || null,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to create tag");

      const data = await response.json();

      if (data.downloadUrl) {
        // Download the ZIP containing single QR
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = `${singleForm.name}-qr.zip`;
        link.click();
      }

      // Reset form
      setSingleForm({
        name: "",
        customMessage: "",
        rewardNote: "",
        contactWhatsapp: "",
        qrPreview: "",
      });

      fetchTags();
      alert("Tag created successfully!");
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("Failed to create tag. Please try again.");
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      const response = await fetch(`/admin/api/vdp/generate?tagId=${tagId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete tag");

      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert("Failed to delete tag. Please try again.");
    }
  };

  const downloadQR = async (slug: string, tagName: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const qrUrl = `${baseUrl}/p/${slug}`;

      // Find the tag to determine tier
      const tag = tags.find(t => t.slug === slug);
      const isPremium = tag?.tier === "premium" || tag?.productType === "acrylic";
      const productType = tag?.bundleType || tag?.productType || "standard";

      let qrDataUrl: string;

      if (isPremium) {
        qrDataUrl = await generatePremiumQR(qrUrl, productType, 600);
      } else {
        qrDataUrl = await generateStandardQR(qrUrl, 600);
      }

      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `qr-${slug}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading QR:", error);
      alert("Failed to download QR code.");
    }
  };

  const openPreview = async (tag: Tag) => {
    setPreviewTag(tag);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const qrUrl = `${baseUrl}/p/${tag.slug}`;
      const isPremium = tag.tier === "premium" || tag.productType === "acrylic";
      const productType = tag.bundleType || tag.productType || "standard";

      let qrDataUrl: string;

      if (isPremium) {
        qrDataUrl = await generatePremiumQR(qrUrl, productType, 300);
      } else {
        qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 300,
          margin: 3,
          color: { dark: "#000000", light: "#ffffff" },
        });
      }
      setPreviewQrData(qrDataUrl);
    } catch (error) {
      console.error("Error generating preview QR:", error);
    }
  };

  const toggleTagSelection = (tagId: string) => {
    const newSelected = new Set(selectedTagIds);
    if (newSelected.has(tagId)) {
      newSelected.delete(tagId);
    } else {
      newSelected.add(tagId);
    }
    setSelectedTagIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTagIds(new Set(tags.map(t => t.id)));
    } else {
      setSelectedTagIds(new Set());
    }
  };

  const isAllSelected = tags.length > 0 && selectedTagIds.size === tags.length;
  const isSomeSelected = selectedTagIds.size > 0 && !isAllSelected;

  const handleDownloadSelected = async () => {
    const selectedTags = tags.filter(t => selectedTagIds.has(t.id));
    for (const tag of selectedTags) {
      await downloadQR(tag.slug, tag.name);
    }
  };

  const handlePrintSelected = async () => {
    if (selectedTagIds.size === 0) {
      alert("Select at least 1 QR code to print.");
      return;
    }

    const selectedTags = tags.filter(t => selectedTagIds.has(t.id));
    setIsLoadingTags(true);

    try {
      const qrCodes = [];
      for (const tag of selectedTags) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const qrUrl = `${baseUrl}/p/${tag.slug}`;
        const isPremium = tag.tier === "premium" || tag.productType === "acrylic";
        const productType = tag.bundleType || tag.productType || "standard";

        let qrDataUrl: string;

        if (isPremium) {
          qrDataUrl = await generatePremiumQR(qrUrl, productType, 300);
        } else {
          qrDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 300,
            margin: 3,
            color: { dark: "#000000", light: "#ffffff" },
          });
        }
        qrCodes.push({ tag, qrDataUrl });
      }
      setPrintPreviewQrCodes(qrCodes);
      setShowPrintPreview(true);
    } catch (error) {
      console.error("Error preparing print preview:", error);
      alert("Failed to prepare print preview.");
    } finally {
      setIsLoadingTags(false);
    }
  };

  const executePrint = () => {
    window.print();
  };

  const getEstimatedSheets = () => {
    const itemsPerSheet = formData.paperSize === "a4" ? 12 : 20;
    return Math.ceil(formData.quantity / itemsPerSheet);
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral/30 border border-secondary/10">
          <TabsTrigger value="generate" className="data-[state=active]:bg-surface data-[state=active]:text-primary">
            Generate New Tags
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-surface data-[state=active]:text-primary">
            Manage Existing Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Bulk Generation Form */}
            <Card className="lg:col-span-3 bg-surface border-secondary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-neutral/30 border-b border-secondary/5 p-4">
                <CardTitle className="font-display text-lg font-bold text-primary">Bulk Generate Tags</CardTitle>
                <CardDescription className="font-body text-xs text-secondary mt-0.5">
                  Create a batch of unclaimed tags for high-precision production.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleBulkGenerate} className="space-y-5">
                  {/* Basic Configuration - 4 column grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Batch Name - 2 cols */}
                    <div className="lg:col-span-2 space-y-2">
                      <Label htmlFor="batchName" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Batch Name</Label>
                      <Input
                        id="batchName"
                        placeholder="e.g., Batch-May-2025-001"
                        className="font-body text-sm rounded-sm border-secondary/20 focus:border-tertiary focus:ring-tertiary/20 h-10"
                        value={formData.batchName}
                        onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                        required
                      />
                    </div>

                    {/* Quantity - 1 col */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max="1000"
                        step="10"
                        className="font-body text-sm rounded-sm border-secondary/20 h-10"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>

                    {/* Material Type - 1 col */}
                    <div className="space-y-2">
                      <Label htmlFor="materialType" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Material</Label>
                      <Select
                        value={formData.materialType}
                        onValueChange={(value: "sticker" | "acrylic") =>
                          setFormData({ ...formData, materialType: value })
                        }
                      >
                        <SelectTrigger id="materialType" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-body text-sm">
                          <SelectItem value="sticker">Stiker (Vinyl)</SelectItem>
                          <SelectItem value="acrylic">Akrilik (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Configuration - 4 column grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Product Module - 2 cols */}
                    <div className="lg:col-span-2 space-y-2">
                      <Label htmlFor="productType" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Product Module</Label>
                      <Select
                        value={formData.productType}
                        onValueChange={(value: any) => setFormData({ ...formData, productType: value })}
                      >
                        <SelectTrigger id="productType" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-body text-sm">
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="student_kit">Student Kit</SelectItem>
                          <SelectItem value="otomotif">Otomotif</SelectItem>
                          <SelectItem value="pertanian">Pertanian</SelectItem>
                          <SelectItem value="diklat">Diklat B2B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Paper Size - 1 col */}
                    <div className="space-y-2">
                      <Label htmlFor="paperSize" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Paper Size</Label>
                      <Select
                        value={formData.paperSize}
                        onValueChange={(value: "a4" | "a3") => setFormData({ ...formData, paperSize: value })}
                      >
                        <SelectTrigger id="paperSize" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-body text-sm">
                          <SelectItem value="a4">A4 (21 x 29.7 cm)</SelectItem>
                          <SelectItem value="a3">A3 (29.7 x 42 cm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Estimate info - 1 col */}
                    <div className="flex items-end">
                      <p className="text-[10px] text-secondary/70 leading-tight">
                        Est. <span className="font-bold text-primary">{getEstimatedSheets()}</span> sheets
                      </p>
                    </div>
                  </div>

                  {/* Sticker Configuration - Only for stickers */}
                  {formData.materialType === "sticker" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 bg-neutral/10 rounded-sm border border-secondary/10">
                      <div className="space-y-2">
                        <Label htmlFor="stickerShape" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Sticker Shape</Label>
                        <Select
                          value={formData.stickerShape}
                          onValueChange={(value: "circle" | "square" | "rectangle") =>
                            setFormData({ ...formData, stickerShape: value })
                          }
                        >
                          <SelectTrigger id="stickerShape" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="font-body text-sm">
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rectangle">Rectangle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stickerSize" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Sticker Size</Label>
                        <Select
                          value={formData.stickerSize}
                          onValueChange={(value: "small" | "medium" | "large") =>
                            setFormData({ ...formData, stickerSize: value })
                          }
                        >
                          <SelectTrigger id="stickerSize" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="font-body text-sm">
                            <SelectItem value="small">Small (20mm)</SelectItem>
                            <SelectItem value="medium">Medium (35mm)</SelectItem>
                            <SelectItem value="large">Large (50mm)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isGenerating && (
                    <div className="space-y-2 p-3 bg-neutral/20 rounded-sm">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-secondary">Generating QR Codes...</span>
                        <span className="text-primary">{progress.current} / {progress.total}</span>
                      </div>
                      <div className="w-full bg-secondary/20 rounded-full h-2">
                        <div
                          className="bg-tertiary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  {downloadUrl && !isGenerating && (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = downloadUrl;
                          link.download = `${formData.batchName || 'batch'}-qr-codes.zip`;
                          link.click();
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download ZIP ({generatedTags.length} files)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDownloadUrl(null);
                          setGeneratedTags([]);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isGenerating || !formData.batchName}
                    className={cn(
                      "w-full py-4 rounded-sm font-label text-xs uppercase tracking-[0.2em] font-bold shadow-lg transition-all active:scale-[0.98]",
                      isGenerating ? "bg-secondary text-surface" : "bg-tertiary text-surface hover:brightness-110"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Package className="w-4 h-4 mr-3 animate-spin" />
                        Generating Assets...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-3" />
                        Generate & Export ZIP
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card className="bg-primary text-surface border-none shadow-xl overflow-hidden relative">
                <CardHeader className="pb-2 px-4 pt-4 relative z-10">
                  <CardTitle className="font-display text-lg font-bold tracking-tight">Batch Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4 relative z-10">
                  <div className="flex justify-between items-end border-b border-surface/10 pb-3">
                    <div>
                      <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Total Tags</p>
                      <p className="font-display text-3xl font-bold">{formData.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Sheets</p>
                      <p className="font-display text-3xl font-bold">{getEstimatedSheets()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-sm bg-surface/10 flex items-center justify-center shrink-0">
                        <Info className="w-3.5 h-3.5 text-tertiary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Material</p>
                        <p className="font-body text-xs font-medium capitalize truncate">
                          {formData.materialType === "sticker" ? "Vinyl Sticker" : "Acrylic"}
                          {formData.materialType === "sticker" && ` (${formData.stickerShape}, ${formData.stickerSize})`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-sm bg-surface/10 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 text-tertiary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Module</p>
                        <p className="font-body text-xs font-medium capitalize">{formData.productType.replace("_", " ")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute -bottom-8 -right-8 opacity-5">
                  <Package size={150} />
                </div>
              </Card>

              <Card className="bg-surface border-secondary/10 shadow-sm">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="font-display text-base font-bold text-primary">Instructions</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <ul className="space-y-2">
                    {[
                      "Define batch parameters",
                      "Generate assets",
                      "Download ZIP",
                      "Send to production",
                      "Monitor via Activity Feed",
                    ].map((step, i) => (
                      <li key={i} className="flex gap-2 group">
                        <span className="font-data-mono text-[10px] text-tertiary font-bold shrink-0">{i + 1}.</span>
                        <span className="font-body text-xs text-secondary group-hover:text-primary transition-colors">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-neutral p-4 rounded-lg border-l-4 border-tertiary flex gap-3">
                <AlertCircle className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                <p className="font-body text-[10px] text-primary leading-relaxed">
                  <span className="font-bold">Operational Note:</span> Generated tags will be initialized with "unclaimed" status. These will not be associated with any user until manual claim or fulfillment assignment.
                </p>
              </div>
            </div>
          </div>

          {/* Single Tag Creation */}
          <Card className="bg-surface border-secondary/10 shadow-sm">
            <CardHeader className="bg-neutral/30 border-b border-secondary/5 p-4">
              <CardTitle className="font-display text-lg font-bold text-primary">Create Single Tag</CardTitle>
              <CardDescription className="font-body text-xs text-secondary mt-0.5">
                Create individual tags with custom configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSingleCreate} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tagName" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Tag Name</Label>
                        <Input
                          id="tagName"
                          placeholder="e.g., Gantungan Kunci Akrilik 001"
                          className="font-body text-sm rounded-sm border-secondary/20 h-10"
                          value={singleForm.name}
                          onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactWhatsapp" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">WhatsApp Contact</Label>
                        <Input
                          id="contactWhatsapp"
                          placeholder="e.g., 628123456789"
                          className="font-body text-sm rounded-sm border-secondary/20 h-10"
                          value={singleForm.contactWhatsapp}
                          onChange={(e) => setSingleForm({ ...singleForm, contactWhatsapp: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customMessage" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Custom Message</Label>
                      <Textarea
                        id="customMessage"
                        placeholder="e.g., Ini adalah barang kesayangan saya..."
                        rows={2}
                        className="font-body text-sm rounded-sm border-secondary/20 resize-none"
                        value={singleForm.customMessage}
                        onChange={(e) => setSingleForm({ ...singleForm, customMessage: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rewardNote" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Reward Note</Label>
                      <Input
                        id="rewardNote"
                        placeholder="e.g., Akan memberi imbalan bensin 20k"
                        className="font-body text-sm rounded-sm border-secondary/20 h-10"
                        value={singleForm.rewardNote}
                        onChange={(e) => setSingleForm({ ...singleForm, rewardNote: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-tertiary text-surface hover:brightness-110 py-3">
                      <QrCode className="w-4 h-4 mr-2" />
                      Create Single Tag
                    </Button>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-neutral/20 rounded-sm p-4">
                    {singleForm.qrPreview ? (
                      <>
                        <div className="bg-white p-3 rounded-sm shadow-sm mb-3">
                          <img src={singleForm.qrPreview} alt="QR Code Preview" className="w-32 h-32" />
                        </div>
                        <p className="text-xs text-secondary text-center">
                          Preview QR Code for: <br />
                          <span className="font-medium text-primary">{singleForm.name}</span>
                        </p>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="w-32 h-32 bg-secondary/10 rounded-sm flex items-center justify-center mb-3 mx-auto">
                          <QrCode className="w-12 h-12 text-secondary/30" />
                        </div>
                        <p className="text-xs text-secondary">
                          Enter tag name to preview QR code
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-5 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-surface border-secondary/10 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary">Total Tags</p>
                    <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-tertiary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-secondary/10 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary">Claimed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.claimed}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-secondary/10 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary">Unclaimed</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.unclaimed}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-600/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-secondary/20">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                filter === "all"
                  ? "text-tertiary border-b-2 border-tertiary"
                  : "text-secondary hover:text-primary"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("claimed")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                filter === "claimed"
                  ? "text-tertiary border-b-2 border-tertiary"
                  : "text-secondary hover:text-primary"
              )}
            >
              Claimed
            </button>
            <button
              onClick={() => setFilter("unclaimed")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                filter === "unclaimed"
                  ? "text-tertiary border-b-2 border-tertiary"
                  : "text-secondary hover:text-primary"
              )}
            >
              Unclaimed
            </button>
          </div>

          {/* Bulk Actions Bar */}
          {selectedTagIds.size > 0 && (
            <div className="sticky top-0 z-10 bg-tertiary/5 border border-tertiary/20 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-surface" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {selectedTagIds.size} QR Selected
                    </p>
                    <p className="text-xs text-secondary">
                      Select actions for selected QR codes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handlePrintSelected}
                    disabled={isLoadingTags}
                    size="sm"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>

                  <Button
                    onClick={handleDownloadSelected}
                    variant="outline"
                    size="sm"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Download
                  </Button>

                  <Button
                    onClick={() => setSelectedTagIds(new Set())}
                    variant="destructive"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tags List */}
          {isLoadingTags ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary"></div>
            </div>
          ) : tags.length === 0 ? (
            <Card className="bg-surface border-secondary/10 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-secondary/30" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  No tags found
                </h3>
                <p className="text-secondary">
                  {filter === "unclaimed" ? "No unclaimed tags." : "Create your first tag to get started."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-surface border-secondary/10 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral/20 border-b border-secondary/10">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(input) => {
                              if (isSomeSelected && input) {
                                input.indeterminate = true;
                              }
                            }}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 text-tertiary border-secondary/30 rounded focus:ring-tertiary"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Slug
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                      {tags.map((tag) => (
                        <tr
                          key={tag.id}
                          className={cn(
                            "hover:bg-neutral/20 transition-colors",
                            selectedTagIds.has(tag.id) ? "bg-tertiary/10" : ""
                          )}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedTagIds.has(tag.id)}
                              onChange={() => toggleTagSelection(tag.id)}
                              className="w-4 h-4 text-tertiary border-secondary/30 rounded focus:ring-tertiary"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-primary">
                              {tag.name}
                            </div>
                            {tag.contactWhatsapp && (
                              <div className="text-xs text-secondary mt-1">
                                {tag.contactWhatsapp}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-secondary font-mono">
                              {tag.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {tag.ownerId ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                                Claimed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">
                                Unclaimed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-secondary">
                              {new Date(tag.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => openPreview(tag)}
                              className="text-secondary hover:text-primary"
                              title="Preview QR"
                            >
                              <Eye className="w-5 h-5 inline" />
                            </button>
                            <button
                              onClick={() => downloadQR(tag.slug, tag.name)}
                              className="text-tertiary hover:text-primary"
                              title="Download QR"
                            >
                              <FileDown className="w-5 h-5 inline" />
                            </button>
                            {!tag.ownerId && (
                              <button
                                onClick={() => handleDelete(tag.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="bg-surface w-full max-w-md">
            <CardHeader className="border-b border-secondary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl font-bold text-primary">
                  Preview QR Code
                </CardTitle>
                <button
                  onClick={() => {
                    setPreviewTag(null);
                    setPreviewQrData(null);
                  }}
                  className="p-2 hover:bg-neutral/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="bg-white p-4 rounded-sm shadow-sm mb-4 flex items-center justify-center">
                {previewQrData ? (
                  <img src={previewQrData} alt={`QR ${previewTag.name}`} className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 bg-secondary/10 rounded-sm flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary"></div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-sm text-secondary">
                  <span className="font-medium">Name:</span> {previewTag.name}
                </p>
                <p className="text-sm text-secondary break-all">
                  <span className="font-medium">URL:</span> {process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/p/{previewTag.slug}
                </p>
                {previewTag.customMessage && (
                  <p className="text-sm text-secondary">
                    <span className="font-medium">Message:</span> {previewTag.customMessage}
                  </p>
                )}
                {previewTag.rewardNote && (
                  <p className="text-sm text-secondary">
                    <span className="font-medium">Reward:</span> {previewTag.rewardNote}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => downloadQR(previewTag.slug, previewTag.name)}
                  className="flex-1 bg-tertiary text-surface hover:brightness-110"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
                <Button
                  onClick={() => {
                    setPreviewTag(null);
                    setPreviewQrData(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b border-secondary/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-xl font-bold text-primary">
                    Print Preview - A4
                  </CardTitle>
                  <CardDescription className="text-sm text-secondary mt-1">
                    {printPreviewQrCodes.length} QR codes will be printed
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowPrintPreview(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 bg-neutral/20">
              <div className="bg-white shadow-lg mx-auto a4-print-container">
                <div className="text-center py-4 border-b-2 border-primary mb-4">
                  <h2 className="text-lg font-bold text-primary">BALIKIN - QR Stok</h2>
                  <p className="text-sm text-secondary">
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="px-4 pt-2 pb-4 grid grid-cols-3 gap-4">
                  {printPreviewQrCodes.map(({ tag, qrDataUrl }) => (
                    <div key={tag.id} className="border border-dashed border-secondary/30 rounded-sm p-4 flex flex-col items-center">
                      <img
                        src={qrDataUrl}
                        alt={`QR ${tag.name}`}
                        className="w-24 h-24"
                      />
                      <p className="font-semibold text-xs text-primary mt-2 text-center truncate w-full">
                        {tag.name}
                      </p>
                      <p className="text-[10px] text-secondary font-mono text-center truncate w-full">
                        /p/{tag.slug}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center py-2 border-t border-secondary/30 mt-2 text-xs text-secondary">
                  <p>Generated by BALIKIN - Smart Lost & Found</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-secondary/10 flex gap-3">
              <Button
                onClick={() => setShowPrintPreview(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={executePrint}
                className="flex-1 bg-tertiary text-surface hover:brightness-110"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}