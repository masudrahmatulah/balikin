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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Generate New Tags</CardTitle>
          <CardDescription>Create a batch of unclaimed tags for production</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Batch Name */}
            <div className="space-y-2">
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                placeholder="e.g., Batch-May-2025-001"
                value={formData.batchName}
                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                required
              />
              <p className="text-sm text-gray-500">Give this batch a recognizable name</p>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                step="10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
              <p className="text-sm text-gray-500">Number of tags to generate (max 1000 per batch)</p>
            </div>

            {/* Material Type */}
            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type</Label>
              <Select
                value={formData.materialType}
                onValueChange={(value: "sticker" | "acrylic") =>
                  setFormData({ ...formData, materialType: value })
                }
              >
                <SelectTrigger id="materialType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sticker">Stiker (Vinyl)</SelectItem>
                  <SelectItem value="acrylic">Akrilik</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Choose the material type for this batch</p>
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type</Label>
              <Select
                value={formData.productType}
                onValueChange={(value: any) => setFormData({ ...formData, productType: value })}
              >
                <SelectTrigger id="productType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="student_kit">Student Kit</SelectItem>
                  <SelectItem value="otomotif">Otomotif</SelectItem>
                  <SelectItem value="pertanian">Pertanian</SelectItem>
                  <SelectItem value="diklat">Diklat B2B</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Select the product type/module</p>
            </div>

            {/* Paper Size */}
            <div className="space-y-2">
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select
                value={formData.paperSize}
                onValueChange={(value: "a4" | "a3") => setFormData({ ...formData, paperSize: value })}
              >
                <SelectTrigger id="paperSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (21 x 29.7 cm)</SelectItem>
                  <SelectItem value="a3">A3 (29.7 x 42 cm)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Select PDF paper size for print layout</p>
            </div>

            <Button type="submit" disabled={isGenerating || !formData.batchName} className="w-full">
              {isGenerating ? "Generating..." : "Generate & Export PDF"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <div className="space-y-6">
        {/* Batch Info */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Tags</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formData.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Sheets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{getEstimatedSheets()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formData.paperSize === "a4" ? "A4 (12 per sheet)" : "A3 (20 per sheet)"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Material</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {formData.materialType === "sticker" ? "Vinyl Sticker" : "Acrylic"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Product Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {formData.productType.replace("_", " ")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Fill in the batch details</p>
            <p>2. Click "Generate & Export PDF"</p>
            <p>3. Download the PDF file</p>
            <p>4. Send to printing/laser cutting</p>
            <p>5. Check print queue for status</p>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className={cn("border-yellow-200 dark:border-yellow-800", "bg-yellow-50 dark:bg-yellow-900/20")}>
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-400">Note</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700 dark:text-yellow-500">
            Generated tags will have status "unclaimed" and will not be assigned to any user until claimed manually or assigned during fulfillment.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
