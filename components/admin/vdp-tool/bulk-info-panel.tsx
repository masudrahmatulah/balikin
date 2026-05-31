import { Card, CardContent } from "@/components/ui/card";
import { Package, Info, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkInfoPanelProps {
  quantity: number;
  materialType: string;
  productType: string;
  paperSize: string;
  stickerShape?: string;
  stickerSize?: string;
}

export function BulkInfoPanel({
  quantity,
  materialType,
  productType,
  paperSize,
  stickerShape,
  stickerSize,
}: BulkInfoPanelProps) {
  const getEstimatedSheets = () => {
    const itemsPerSheet = paperSize === "a4" ? 12 : 20;
    return Math.ceil(quantity / itemsPerSheet);
  };

  const getMaterialLabel = () => {
    if (materialType === "sticker") {
      return `Vinyl Sticker (${stickerShape}, ${stickerSize})`;
    }
    return "Acrylic (Premium)";
  };

  const getProductLabel = () => {
    return productType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="bg-primary text-surface border-none shadow-xl overflow-hidden relative">
      <CardContent className="space-y-5 p-5 relative z-10">
        {/* Main Stats */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-label text-[9px] uppercase tracking-widest text-surface/60">Total Tags</p>
            <p className="font-display text-4xl font-bold mt-1">{quantity}</p>
          </div>
          <div className="text-right">
            <p className="font-label text-[9px] uppercase tracking-widest text-surface/60">Est. Sheets</p>
            <p className="font-display text-4xl font-bold mt-1">{getEstimatedSheets()}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-surface/20" />

        {/* Configuration Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-sm bg-surface/10 flex items-center justify-center shrink-0 mt-0.5">
              <Package className="w-3.5 h-3.5 text-tertiary" />
            </div>
            <div>
              <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Material</p>
              <p className="font-body text-xs font-medium">{getMaterialLabel()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-sm bg-surface/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5 text-tertiary" />
            </div>
            <div>
              <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Product</p>
              <p className="font-body text-xs font-medium">{getProductLabel()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-sm bg-surface/10 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-tertiary" />
            </div>
            <div>
              <p className="font-label text-[9px] uppercase tracking-widest text-surface/50">Paper Size</p>
              <p className="font-body text-xs font-medium uppercase">{paperSize}</p>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="flex items-start gap-2 p-3 bg-surface/10 rounded-sm">
          <Info className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
          <p className="font-body text-[10px] text-surface/80 leading-relaxed">
            <span className="font-medium">Tip:</span> Generated tags will be unclaimed until claimed by users or assigned manually.
          </p>
        </div>
      </CardContent>

      {/* Background Decoration */}
      <div className="absolute -bottom-8 -right-8 opacity-5">
        <Package size={150} />
      </div>
    </Card>
  );
}