"use client";

import { useState } from "react";
import { BulkForm } from "./bulk-form";
import { BulkInfoPanel } from "./bulk-info-panel";

interface BulkGenerationSectionProps {
  adminId: string;
  onGenerated?: () => void;
}

export function BulkGenerationSection({ adminId, onGenerated }: BulkGenerationSectionProps) {
  const [formData, setFormData] = useState({
    batchName: "",
    quantity: 100,
    materialType: "sticker" as "sticker" | "acrylic-oval" | "acrylic-octagon" | "acrylic-heart" | "acrylic-rectangle" | "acrylic-rectangle-motif" | "acrylic-square" | "acrylic-circle" | "acrylic-rectangle-emboss",
    productType: "standard" as "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat",
    paperSize: "a4" as "a4" | "a3",
    stickerShape: "circle" as "circle" | "square" | "rectangle",
    stickerSize: "medium" as "small" | "medium" | "large",
  });

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">VDP Tool</h1>
        <p className="font-body text-sm text-secondary mt-1">
          Generate and manage QR codes for production
        </p>
      </div>

      {/* Bulk Generation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Card - 3 columns */}
        <div className="lg:col-span-3">
          <BulkForm
            adminId={adminId}
            onGenerate={onGenerated}
            onDataChange={setFormData}
          />
        </div>

        {/* Info Panel - 1 column */}
        <div className="lg:col-span-1">
          <BulkInfoPanel
            quantity={formData.quantity}
            materialType={formData.materialType}
            productType={formData.productType}
            paperSize={formData.paperSize}
            stickerShape={formData.stickerShape}
            stickerSize={formData.stickerSize}
          />
        </div>
      </div>
    </div>
  );
}