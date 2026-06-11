"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Package, X, CheckCircle } from "lucide-react";

interface BulkFormProps {
  adminId: string;
  onGenerate?: (data: any) => void;
  onDataChange?: (data: any) => void;
}

export function BulkForm({ adminId, onGenerate, onDataChange }: BulkFormProps) {
  const [formData, setFormData] = useState({
    batchName: "",
    quantity: 100,
    materialType: "sticker" as "sticker" | "acrylic" | "acrylic-cutfold",
    productType: "standard" as "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat",
    paperSize: "a4" as "a4" | "a3",
    stickerShape: "circle" as "circle" | "square" | "rectangle",
    stickerSize: "medium" as "small" | "medium" | "large",
  });

  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);

  const getEstimatedSheets = () => {
    const itemsPerSheet = formData.paperSize === "a4" ? 15 : 32; // A4: 3×5=15, A3: 4×8=32
    return Math.ceil(formData.quantity / itemsPerSheet);
  };

  const getQuantityValidation = () => {
    if (formData.quantity < 1) {
      return {
        valid: false,
        message: "Quantity minimal 1",
      };
    }
    return { valid: true, message: "" };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchName) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: formData.quantity });
    setDownloadUrl(null);
    setGeneratedCount(0);

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
      setGeneratedCount(data.quantity);

      if (onGenerate) {
        onGenerate(data);
      }

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
    } catch (error) {
      console.error("Error generating batch:", error);
      alert("Failed to generate batch. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-surface border-secondary/10 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-lg font-bold text-primary flex items-center gap-2">
          <Package className="w-5 h-5 text-tertiary" />
          Bulk Generate Tags
        </CardTitle>
        <CardDescription className="font-body text-xs text-secondary mt-1">
          Generate QR codes in bulk for production
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Batch Name - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="batchName" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
              Batch Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="batchName"
              placeholder="e.g., Batch-May-2025-001"
              className="font-body text-sm rounded-sm border-secondary/20 focus:border-tertiary focus:ring-tertiary/20 h-10"
              value={formData.batchName}
              onChange={(e) => updateFormData({ batchName: e.target.value })}
              required
            />
          </div>

          {/* Quantity & Material - 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                step="1"
                className="font-body text-sm rounded-sm border-secondary/20 h-10"
                value={formData.quantity}
                onChange={(e) => updateFormData({ quantity: parseInt(e.target.value) || 1 })}
                required
              />
              <p className="font-body text-[10px] text-secondary/60">
                Max 1000 tags per batch
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialType" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
                Material
              </Label>
              <Select
                value={formData.materialType}
                onValueChange={(value: "sticker" | "acrylic" | "acrylic-cutfold") =>
                  updateFormData({ materialType: value })
                }
              >
                <SelectTrigger id="materialType" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-body text-sm">
                  <SelectItem value="sticker">Sticker (Vinyl)</SelectItem>
                  <SelectItem value="acrylic">Acrylic (Premium)</SelectItem>
                  <SelectItem value="acrylic-cutfold">Akrilik Cut & Fold (Portrait 3x3.7cm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Type & Paper Size - 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productType" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
                Product Module
              </Label>
              <Select
                value={formData.productType}
                onValueChange={(value: any) => updateFormData({ productType: value })}
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

            <div className="space-y-2">
              <Label htmlFor="paperSize" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
                Paper Size
              </Label>
              <Select
                value={formData.paperSize}
                onValueChange={(value: "a4" | "a3") => {
                  updateFormData({ paperSize: value });
                }}
              >
                <SelectTrigger id="paperSize" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-body text-sm">
                  <SelectItem value="a4">A4 (21 x 29.7 cm)</SelectItem>
                  <SelectItem value="a3">A3 (29.7 x 42 cm) - 32/hlm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sticker Configuration - Only for stickers */}
          {formData.materialType === "sticker" && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-neutral/10 rounded-sm border border-secondary/10">
              <div className="space-y-2">
                <Label htmlFor="stickerShape" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
                  Shape
                </Label>
                <Select
                  value={formData.stickerShape}
                  onValueChange={(value: "circle" | "square" | "rectangle") =>
                    updateFormData({ stickerShape: value })
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
                <Label htmlFor="stickerSize" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
                  Size
                </Label>
                <Select
                  value={formData.stickerSize}
                  onValueChange={(value: "small" | "medium" | "large") =>
                    updateFormData({ stickerSize: value })
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

          {/* Success State */}
          {downloadUrl && !isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-sm border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-body text-sm font-medium text-green-800 dark:text-green-200">
                    Successfully generated {generatedCount} QR codes
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = `${formData.batchName || 'batch'}-qr-codes.zip`;
                    link.click();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download ZIP
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDownloadUrl(null);
                    setGeneratedCount(0);
                  }}
                  className="h-10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={isGenerating || !formData.batchName || !getQuantityValidation().valid}
            className="w-full bg-tertiary text-surface hover:brightness-110 h-12 font-label text-xs uppercase tracking-[0.2em] font-bold"
          >
            {isGenerating ? (
              <>
                <Package className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate QR Codes
              </>
            )}
          </Button>

          {/* Validation Warning */}
          {!getQuantityValidation().valid && (
            <p className="font-body text-[10px] text-amber-600 dark:text-amber-400">
              ⚠️ {getQuantityValidation().message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}