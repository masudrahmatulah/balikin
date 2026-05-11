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
import { cn } from "@/lib/utils";
import { Package, Download, Info, AlertCircle } from "lucide-react";

interface VDPToolFormProps {
  adminId: string;
}

export function VDPToolForm({ adminId }: VDPToolFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    batchName: "",
    quantity: 100,
    materialType: "sticker" as "sticker" | "acrylic",
    productType: "standard" as "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat",
    paperSize: "a4" as "a4" | "a3",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch("/admin/api/vdp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          adminId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate batch");
      }

      const data = await response.json();

      // Download PDF
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }

      // Reset form
      setFormData({
        batchName: "",
        quantity: 100,
        materialType: "sticker",
        productType: "standard",
        paperSize: "a4",
      });

      alert("Batch generated successfully!");
    } catch (error) {
      console.error("Error generating batch:", error);
      alert("Failed to generate batch. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getEstimatedSheets = () => {
    const itemsPerSheet = formData.paperSize === "a4" ? 12 : 20; // A4: 3x4, A3: 4x5
    return Math.ceil(formData.quantity / itemsPerSheet);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form - Heritage Style */}
      <Card className="lg:col-span-2 bg-surface border-secondary/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-neutral/30 border-b border-secondary/5 p-8">
          <CardTitle className="font-display text-2xl font-bold text-primary">Generate New Tags</CardTitle>
          <CardDescription className="font-body text-xs text-secondary mt-1">
            Create a batch of unclaimed tags for high-precision production.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Batch Name */}
            <div className="space-y-3">
              <Label htmlFor="batchName" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Batch Name</Label>
              <Input
                id="batchName"
                placeholder="e.g., Batch-May-2025-001"
                className="font-body text-sm rounded-sm border-secondary/20 focus:border-tertiary focus:ring-tertiary/20"
                value={formData.batchName}
                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                required
              />
              <p className="font-body text-[10px] text-secondary/60 italic">Give this batch a recognizable reference name.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quantity */}
              <div className="space-y-3">
                <Label htmlFor="quantity" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="1000"
                  step="10"
                  className="font-body text-sm rounded-sm border-secondary/20"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  required
                />
                <p className="font-body text-[10px] text-secondary/60">Max 1000 tags per execution.</p>
              </div>

              {/* Material Type */}
              <div className="space-y-3">
                <Label htmlFor="materialType" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Material Type</Label>
                <Select
                  value={formData.materialType}
                  onValueChange={(value: "sticker" | "acrylic") =>
                    setFormData({ ...formData, materialType: value })
                  }
                >
                  <SelectTrigger id="materialType" className="font-body text-sm rounded-sm border-secondary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-body text-sm">
                    <SelectItem value="sticker">Stiker (Vinyl)</SelectItem>
                    <SelectItem value="acrylic">Akrilik (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Type */}
              <div className="space-y-3">
                <Label htmlFor="productType" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Product Module</Label>
                <Select
                  value={formData.productType}
                  onValueChange={(value: any) => setFormData({ ...formData, productType: value })}
                >
                  <SelectTrigger id="productType" className="font-body text-sm rounded-sm border-secondary/20">
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

              {/* Paper Size */}
              <div className="space-y-3">
                <Label htmlFor="paperSize" className="font-label text-[10px] uppercase tracking-widest font-bold text-secondary">Layout Paper Size</Label>
                <Select
                  value={formData.paperSize}
                  onValueChange={(value: "a4" | "a3") => setFormData({ ...formData, paperSize: value })}
                >
                  <SelectTrigger id="paperSize" className="font-body text-sm rounded-sm border-secondary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-body text-sm">
                    <SelectItem value="a4">A4 (21 x 29.7 cm)</SelectItem>
                    <SelectItem value="a3">A3 (29.7 x 42 cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isGenerating || !formData.batchName} 
              className={cn(
                "w-full py-7 rounded-sm font-label text-xs uppercase tracking-[0.2em] font-bold shadow-lg transition-all active:scale-[0.98]",
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
                  Generate & Export PDF
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Panels - Heritage Style */}
      <div className="space-y-8">
        {/* Batch Info */}
        <Card className="bg-primary text-surface border-none shadow-xl overflow-hidden relative">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="font-display text-xl font-bold tracking-tight">Batch Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10 pt-4">
            <div className="flex justify-between items-end border-b border-surface/10 pb-4">
              <div>
                <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Total Tags</p>
                <p className="font-display text-4xl font-bold">{formData.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Sheets</p>
                <p className="font-display text-4xl font-bold">{getEstimatedSheets()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-surface/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-tertiary" />
                  </div>
                  <div>
                    <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Material</p>
                    <p className="font-body text-sm font-medium capitalize">{formData.materialType === "sticker" ? "Vinyl Sticker" : "Acrylic"}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-surface/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-tertiary" />
                  </div>
                  <div>
                    <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Module</p>
                    <p className="font-body text-sm font-medium capitalize">{formData.productType.replace("_", " ")}</p>
                  </div>
               </div>
            </div>
          </CardContent>
          {/* Background element */}
          <div className="absolute -bottom-10 -right-10 opacity-5">
             <Package size={200} />
          </div>
        </Card>

        {/* Instructions */}
        <Card className="bg-surface border-secondary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg font-bold text-primary">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-4">
              {[
                "Define batch parameters and identity.",
                "Execute high-resolution asset generation.",
                "Verify and download the compiled PDF.",
                "Transmit to specialized production line.",
                "Monitor status via System Activity Feed."
              ].map((step, i) => (
                <li key={i} className="flex gap-4 group">
                  <span className="font-data-mono text-[10px] text-tertiary font-bold">{i+1}.</span>
                  <span className="font-body text-xs text-secondary group-hover:text-primary transition-colors">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="bg-neutral p-6 rounded-lg border-l-4 border-tertiary flex gap-4">
          <AlertCircle className="w-5 h-5 text-tertiary shrink-0" />
          <p className="font-body text-[11px] text-primary leading-relaxed">
            <span className="font-bold">Operational Note:</span> Generated tags will be initialized with "unclaimed" status. These will not be associated with any user until manual claim or fulfillment assignment.
          </p>
        </div>
      </div>
    </div>
  );
}
