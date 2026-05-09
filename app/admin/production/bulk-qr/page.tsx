"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Download, Package, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk QR Generator</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate multiple QR codes at once for batch production
        </p>
      </div>

      <div className="grid gap-6">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bundle Configuration
            </CardTitle>
            <CardDescription>
              Configure the batch settings for QR code generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bundle Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Bundle Name / Prefix</Label>
              <Input
                id="name"
                placeholder="e.g., STUDENT-01, PROMO-2025"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This prefix will be used in the generated QR codes
              </p>
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type</Label>
              <Select
                value={config.productType}
                onValueChange={(value: "sticker" | "acrylic") =>
                  setConfig({ ...config, productType: value })
                }
                disabled={isGenerating}
              >
                <SelectTrigger id="productType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sticker">Sticker</SelectItem>
                  <SelectItem value="acrylic">Acrylic Tag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sticker Configuration (only for stickers) */}
            {config.productType === "sticker" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shape">Sticker Shape</Label>
                  <Select
                    value={config.stickerShape}
                    onValueChange={(value: "circle" | "square" | "rectangle") =>
                      setConfig({ ...config, stickerShape: value })
                    }
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="shape">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Sticker Size</Label>
                  <Select
                    value={config.stickerSize}
                    onValueChange={(value: "small" | "medium" | "large") =>
                      setConfig({ ...config, stickerSize: value })
                    }
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Item Count */}
            <div className="space-y-2">
              <Label htmlFor="count">Number of QR Codes</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={100}
                value={config.itemCount}
                onChange={(e) => setConfig({ ...config, itemCount: parseInt(e.target.value) || 0 })}
                disabled={isGenerating}
              />
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-3 h-3" />
                <span>Maximum 100 QR codes per batch</span>
              </div>
            </div>

            {/* Auto-activate Module (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="module">Auto-activate Module (Optional)</Label>
              <Select
                value={config.autoActivateModule || ""}
                onValueChange={(value) => setConfig({ ...config, autoActivateModule: value || undefined })}
                disabled={isGenerating}
              >
                <SelectTrigger id="module">
                  <SelectValue placeholder="No module selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Kit</SelectItem>
                  <SelectItem value="otomotif">Otomotif</SelectItem>
                  <SelectItem value="pertanian">Pertanian</SelectItem>
                  <SelectItem value="diklat">Diklat</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically activate this module for all generated tags
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        {isGenerating && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Generating QR Codes...</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
                </div>
                <Progress value={progress} />
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait, this may take a few moments...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Alert */}
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <span>{result.message}</span>
              {result.success && result.downloadUrl && (
                <Button onClick={handleDownload} size="sm" className="ml-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download ZIP
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !config.name || config.itemCount < 1}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Generate QR Codes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
