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
import { Download, Package, X, CheckCircle, Upload, Image as ImageIcon } from "lucide-react";
import { getStickerProductInfo, getStickerProductConfig, type StickerProductKey } from "@/lib/sticker-template";

interface BulkFormProps {
  adminId: string;
  onGenerate?: (data: any) => void;
  onDataChange?: (data: any) => void;
}

export function BulkForm({ adminId, onGenerate, onDataChange }: BulkFormProps) {
  const [formData, setFormData] = useState({
    batchName: "",
    quantity: 100,
    materialType: "sticker" as "sticker" | "acrylic-oval" | "acrylic-octagon" | "acrylic-heart" | "acrylic-rectangle" | "acrylic-rectangle-motif" | "acrylic-square" | "acrylic-circle" | "acrylic-rectangle-emboss",
    productType: "standard" as "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat",
    paperSize: "a5" as "a4" | "a3" | "a5",
    stickerProductKey: "stiker-family" as StickerProductKey,
    stickerShape: "circle" as "circle" | "square" | "rectangle",
    stickerSize: "medium" as "small" | "medium" | "large",
    isCustom: false,
    customPhotoData: "" as string,
    includeActivation: true,
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
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "zip">("zip");
  const [generatedCount, setGeneratedCount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getEstimatedSheets = () => {
    // Based on PRD v3 specifications
    // A3 Landscape: 4 cols × 5 rows = 20 packets per sheet
    // A4 Landscape: 3 cols × 4 rows = 12 packets per sheet
    // A5 Stickers: depends on product type (6-24 per sheet)
    let itemsPerSheet = 12;

    if (formData.materialType === "sticker" && formData.paperSize === "a5") {
      // A5 sticker products - read straight from the shared product config to avoid drift
      itemsPerSheet = getStickerProductConfig(formData.stickerProductKey).total;
    } else if (formData.paperSize === "a4") {
      itemsPerSheet = 12;
    } else {
      itemsPerSheet = 20;
    }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, customPhotoData: base64 });
      setPreviewImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearCustomPhoto = () => {
    setFormData({ ...formData, customPhotoData: "" });
    setPreviewImage(null);
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
      setDownloadFormat(data.downloadFormat === "pdf" ? "pdf" : "zip");
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
        paperSize: "a5",
        stickerProductKey: "stiker-family",
        stickerShape: "circle",
        stickerSize: "medium",
        isCustom: false,
        customPhotoData: "",
      });
      setPreviewImage(null);
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
                onValueChange={(value: any) =>
                  updateFormData({ materialType: value })
                }
              >
                <SelectTrigger id="materialType" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-body text-sm">
                  <SelectItem value="sticker">Sticker (Vinyl)</SelectItem>
                  <SelectItem value="acrylic-oval">Akrilik OVAL</SelectItem>
                  <SelectItem value="acrylic-octagon">Akrilik Persegi Delapan</SelectItem>
                  <SelectItem value="acrylic-heart">Akrilik Hati</SelectItem>
                  <SelectItem value="acrylic-rectangle">Akrilik Persegi Panjang</SelectItem>
                  <SelectItem value="acrylic-rectangle-motif">Akrilik Persegi Panjang Motif</SelectItem>
                  <SelectItem value="acrylic-square">Akrilik Kotak</SelectItem>
                  <SelectItem value="acrylic-circle">Akrilik Lingkaran</SelectItem>
                  <SelectItem value="acrylic-rectangle-emboss">Akrilik Persegi Panjang Timbul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Order Toggle */}
          <div className="flex items-center justify-between p-3 bg-neutral/10 rounded-sm border border-secondary/10">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-tertiary" />
              <div>
                <p className="font-label text-sm font-bold text-primary">Custom Photo Order</p>
                <p className="font-body text-[10px] text-secondary/60">
                  Replace logo with custom photo (layout: QR Utama + Foto + QR Aktivasi)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const newValue = !formData.isCustom;
                setFormData({ ...formData, isCustom: newValue });
                if (!newValue) {
                  clearCustomPhoto();
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isCustom ? "bg-tertiary" : "bg-secondary/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isCustom ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Custom Photo Upload - Only show when isCustom is true */}
          {formData.isCustom && (
            <div className="space-y-2 p-3 bg-tertiary/5 rounded-sm border border-tertiary/20">
              <Label htmlFor="customPhoto" className="font-label text-[10px] uppercase tracking-widest font-bold text-primary">
                Custom Photo <span className="text-red-500">*</span>
              </Label>

              {previewImage ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 bg-white rounded-sm overflow-hidden border border-secondary/20">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearCustomPhoto}
                    className="w-full h-8 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    id="customPhoto"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 w-full h-24 bg-white rounded-sm border-2 border-dashed border-secondary/30 hover:border-tertiary/50 transition-colors">
                    <Upload className="w-5 h-5 text-secondary/40" />
                    <div className="text-center">
                      <p className="font-body text-sm text-secondary/60">Click to upload photo</p>
                      <p className="font-body text-[10px] text-secondary/40">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </div>
              )}

              {formData.isCustom && !formData.customPhotoData && (
                <p className="font-body text-[10px] text-amber-600 dark:text-amber-400">
                  ⚠️ Custom photo is required for custom orders
                </p>
              )}
            </div>
          )}

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
                onValueChange={(value: "a4" | "a3" | "a5") => {
                  updateFormData({ paperSize: value });
                }}
              >
                <SelectTrigger id="paperSize" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-body text-sm">
                  {formData.materialType === "sticker" ? (
                    <SelectItem value="a5">A5 (14.8 x 21 cm) - Sticker Sheet</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="a4">A4 (21 x 29.7 cm)</SelectItem>
                      <SelectItem value="a3">A3 (29.7 x 42 cm) - 32/hlm</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sticker Product Selection - Only for stickers */}
          {formData.materialType === "sticker" && (
            <div className="space-y-2 p-3 bg-neutral/10 rounded-sm border border-secondary/10">
              <Label htmlFor="stickerProductKey" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">
                Sticker Product <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.stickerProductKey}
                onValueChange={(value: StickerProductKey) =>
                  updateFormData({ stickerProductKey: value })
                }
              >
                <SelectTrigger id="stickerProductKey" className="font-body text-sm rounded-sm border-secondary/20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-body text-sm">
                  <SelectItem value="stiker-pro">
                    Stiker Balikin Pro (125×43mm) - 4 per sheet
                  </SelectItem>
                  <SelectItem value="stiker-daily">
                    Stiker Balikin Daily (95×33mm) - 5 per sheet
                  </SelectItem>
                  <SelectItem value="stiker-micro">
                    Stiker Balikin Micro (65×23mm) - 8 per sheet
                  </SelectItem>
                  <SelectItem value="stiker-family">
                    Stiker Balikin Family (1 Pro + 2 Daily + 3 Micro) - 6 per sheet
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="font-body text-[10px] text-secondary/60">
                Estimated sheets: {getEstimatedSheets()} (based on {formData.quantity} quantity)
              </p>
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
                    link.download = `${formData.batchName || 'batch'}-qr-codes.${downloadFormat}`;
                    link.click();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {downloadFormat === "pdf" ? "PDF" : "ZIP"}
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
            disabled={
              isGenerating ||
              !formData.batchName ||
              !getQuantityValidation().valid ||
              (formData.isCustom && !formData.customPhotoData)
            }
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