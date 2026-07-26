"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileArchive, Loader2 } from "lucide-react";

interface VdpBatchDownloadProps {
  className?: string;
}

export function VdpBatchDownload({ className }: VdpBatchDownloadProps) {
  const [materialType, setMaterialType] = useState<string>("all");
  const [format, setFormat] = useState<"pdf" | "zip">("pdf");
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);

    try {
      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      // In production, this would call your VDP API
      // For demo purposes, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setProgress(100);

      // Trigger download (placeholder)
      const filename = `vdp-batch-${materialType}-${new Date().toISOString().split('T')[0]}.${format}`;

      // Create a dummy download
      const blob = new Blob([`VDP Batch Download: ${materialType}, Format: ${format}`], { type: format === 'pdf' ? 'application/pdf' : 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsDownloading(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Download className="w-5 h-5" />
            VDP Batch Download
          </CardTitle>
          <CardDescription className="mt-1">
            One-click batch QR Code downloads
          </CardDescription>
        </div>
        {isDownloading && (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {Math.round(progress)}%
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Material Type
            </label>
            <Select value={materialType} onValueChange={setMaterialType} disabled={isDownloading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                <SelectItem value="vinyl">Stiker Vinyl</SelectItem>
                <SelectItem value="acrylic">Akrilik (All Shapes)</SelectItem>
                <SelectItem value="bundles">Bundling Kits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Format
            </label>
            <Select value={format} onValueChange={(v: "pdf" | "zip") => setFormat(v)} disabled={isDownloading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF (A3 Matrix)</SelectItem>
                <SelectItem value="zip">ZIP (Vector Images)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              PDF Format
            </span>
            <span>A3 matrix with cutting marks</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FileArchive className="w-4 h-4" />
              ZIP Format
            </span>
            <span>High-res vector QR codes</span>
          </div>
        </div>

        {isDownloading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Preparing download...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Batch
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function VdpBatchDownloadSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}