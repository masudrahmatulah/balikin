"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileArchive, Wrench } from "lucide-react";

interface VdpBatchDownloadProps {
  className?: string;
}

export function VdpBatchDownload({ className }: VdpBatchDownloadProps) {
  return (
    <Card className={`border-blue-100/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 ${className ?? ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Download className="h-5 w-5 text-blue-600" />
            VDP Batch Download
          </CardTitle>
          <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">
            Generate & unduh QR Code batch via VDP Tool
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              PDF
            </span>
            <span>Matriks cetak dengan cutting marks</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FileArchive className="w-4 h-4" />
              ZIP
            </span>
            <span>Aset QR code resolusi tinggi</span>
          </div>
        </div>

        <Badge variant="secondary" className="w-full justify-center py-1.5">
          Proses generate dijalankan di VDP Tool
        </Badge>

        <Link href="/admin/vdp-tool" className="block">
          <Button className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-900/20 hover:from-orange-600 hover:to-amber-600">
            <Wrench className="w-4 h-4" />
            Buka VDP Tool
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function VdpBatchDownloadSkeleton() {
  return (
    <Card className="border-blue-100/80 bg-white/90 dark:border-slate-700 dark:bg-slate-900/90">
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
