"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, Package, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BundleConfig {
  name: string;
  productType: "sticker" | "acrylic";
  stickerShape?: "circle" | "square" | "rectangle";
  stickerSize?: "small" | "medium" | "large";
  itemCount: number;
  autoActivateModule?: string;
}

/**
 * Bulk QR Generator Page
 * Production division tool for batch QR generation
 * Generates up to 100 QR codes at once with configurable prefixes
 */
export default function BulkQRPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string; downloadUrl?: string } | null>(null);

  const [config, setConfig] = useState<BundleConfig>({
    name: "",
    productType: "sticker",
    stickerShape: "circle",
    stickerSize: "medium",
    itemCount: 10,
    autoActivateModule: undefined,
  });

  const handleGenerate = async () => {
    if (!config.name || config.itemCount < 1 || config.itemCount > 100) {
      setResult({
        success: false,
        message: "Please provide a valid name and item count (1-100)",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch("/api/admin/production/generate-bulk-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        setProgress(100);
        setResult({
          success: true,
          message: `Successfully generated ${config.itemCount} QR codes!`,
          downloadUrl: data.downloadUrl,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to generate QR codes",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, "_blank");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header - Heritage Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-secondary/10 pb-8">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label text-[10px] uppercase tracking-widest mb-4"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Production
          </button>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Bulk QR Generator</h1>
          <p className="font-body text-sm text-secondary mt-2">Generate multiple QR codes at once for batch production.</p>
        </div>
        <div className="flex items-center gap-3 bg-neutral px-4 py-2 rounded-sm border border-secondary/5">
           <Package className="w-4 h-4 text-tertiary" />
           <span className="font-label text-[10px] uppercase tracking-widest font-bold text-primary">Production Tool</span>
        </div>
      </div>

      <div className="grid gap-12">
        {/* Configuration Card - Heritage Style */}
        <Card className="bg-surface border-secondary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-neutral/30 border-b border-secondary/5 p-8">
            <CardTitle className="font-display text-2xl font-bold text-primary">Bundle Configuration</CardTitle>
            <CardDescription className="font-body text-xs text-secondary">
              Configure the batch settings for high-precision QR code generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Bundle Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Bundle Name / Prefix</Label>
              <Input
                id="name"
                placeholder="e.g., STUDENT-01, PROMO-2025"
                className="font-body text-sm rounded-sm border-secondary/20 focus:border-tertiary focus:ring-tertiary/20"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                disabled={isGenerating}
              />
              <p className="font-body text-[10px] text-secondary/60 italic">
                This prefix will be used as a reference for all tags in this batch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Type */}
              <div className="space-y-3">
                <Label htmlFor="productType" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Product Type</Label>
                <Select
                  value={config.productType}
                  onValueChange={(value: "sticker" | "acrylic") =>
                    setConfig({ ...config, productType: value })
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger id="productType" className="font-body text-sm rounded-sm border-secondary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-body text-sm">
                    <SelectItem value="sticker">Sticker Vinyl</SelectItem>
                    <SelectItem value="acrylic">Acrylic Tag (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Item Count */}
              <div className="space-y-3">
                <Label htmlFor="count" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Quantity</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={100}
                  className="font-body text-sm rounded-sm border-secondary/20"
                  value={config.itemCount}
                  onChange={(e) => setConfig({ ...config, itemCount: parseInt(e.target.value) || 0 })}
                  disabled={isGenerating}
                />
                <p className="font-body text-[10px] text-secondary/60">Limit: 100 units per batch.</p>
              </div>
            </div>

            {/* Sticker Configuration (only for stickers) */}
            {config.productType === "sticker" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-secondary/5">
                <div className="space-y-3">
                  <Label htmlFor="shape" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Sticker Shape</Label>
                  <Select
                    value={config.stickerShape}
                    onValueChange={(value: "circle" | "square" | "rectangle") =>
                      setConfig({ ...config, stickerShape: value })
                    }
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="shape" className="font-body text-sm rounded-sm border-secondary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-body text-sm">
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="size" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Sticker Size</Label>
                  <Select
                    value={config.stickerSize}
                    onValueChange={(value: "small" | "medium" | "large") =>
                      setConfig({ ...config, stickerSize: value })
                    }
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="size" className="font-body text-sm rounded-sm border-secondary/20">
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

            {/* Auto-activate Module (Optional) */}
            <div className="space-y-3 pt-4 border-t border-secondary/5">
              <Label htmlFor="module" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Pre-configured Module (Optional)</Label>
              <Select
                value={config.autoActivateModule || ""}
                onValueChange={(value) => setConfig({ ...config, autoActivateModule: value || undefined })}
                disabled={isGenerating}
              >
                <SelectTrigger id="module" className="font-body text-sm rounded-sm border-secondary/20">
                  <SelectValue placeholder="No module selected" />
                </SelectTrigger>
                <SelectContent className="font-body text-sm">
                  <SelectItem value="student">Student Kit</SelectItem>
                  <SelectItem value="otomotif">Otomotif</SelectItem>
                  <SelectItem value="pertanian">Pertanian</SelectItem>
                  <SelectItem value="diklat">Diklat B2B</SelectItem>
                </SelectContent>
              </Select>
              <p className="font-body text-[10px] text-secondary/60">
                Tags will be automatically initialized with this module upon activation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        {isGenerating && (
          <div className="space-y-4 bg-primary text-surface p-8 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-lg font-bold">Generating Assets...</span>
              <span className="font-data-mono text-xs">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-surface/10" />
            <div className="flex items-center gap-3 text-[10px] font-label uppercase tracking-widest text-surface/60">
              <Loader2 className="w-3 h-3 animate-spin text-tertiary" />
              <span>Compiling database entries and generating high-resolution QR data.</span>
            </div>
          </div>
        )}

        {/* Result Alert */}
        {result && (
          <div className={cn(
            "p-8 rounded-lg border-2 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-300",
            result.success 
              ? "bg-neutral border-secondary/10" 
              : "bg-tertiary/5 border-tertiary text-tertiary"
          )}>
            <div className="flex items-center gap-4">
              {result.success ? (
                <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center text-surface">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-tertiary rounded-sm flex items-center justify-center text-surface">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-display text-xl font-bold text-primary">{result.success ? "Generation Successful" : "Generation Failed"}</h4>
                <p className="font-body text-sm text-secondary">{result.message}</p>
              </div>
            </div>
            
            {result.success && result.downloadUrl && (
              <Button 
                onClick={handleDownload} 
                className="bg-primary text-surface hover:brightness-110 px-8 py-6 rounded-sm font-label text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg transition-all active:scale-95"
              >
                <Download className="w-4 h-4 mr-3" />
                Download Asset ZIP
              </Button>
            )}
          </div>
        )}

        {/* Generate Button - Heritage Single Accent Rule */}
        <div className="flex justify-end gap-6 items-center pt-4 border-t border-secondary/10">
          <button
            onClick={() => router.back()}
            disabled={isGenerating}
            className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary hover:text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !config.name || config.itemCount < 1}
            className={cn(
               "px-12 py-7 rounded-sm font-label text-xs uppercase tracking-[0.2em] font-bold shadow-lg transition-all active:scale-[0.98]",
               isGenerating ? "bg-secondary text-surface" : "bg-tertiary text-surface hover:brightness-110"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-3" />
                Generate Batch
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
