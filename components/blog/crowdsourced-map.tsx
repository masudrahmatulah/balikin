"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted rounded-xl h-64 flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

interface LocationReport {
  id: string;
  locationName: string;
  locationType: string;
  cityName: string;
  lostItemType: string;
  createdAt: string;
}

const LOCATION_TYPES = [
  { value: "Parkiran", label: "Parkiran" },
  { value: "Kafe", label: "Kafe" },
  { value: "Stasiun", label: "Stasiun" },
  { value: "Terminal", label: "Terminal" },
  { value: "Pasar", label: "Pasar" },
  { value: "Mall", label: "Mall/Pusat Perbelanjaan" },
  { value: "Lainnya", label: "Lainnya" },
];

interface CrowdsourcedMapProps {
  mapRegionId: string;
  postId: string;
}

export function BlogCrowdsourcedMap({ mapRegionId, postId }: CrowdsourcedMapProps) {
  const [reports, setReports] = useState<LocationReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    locationName: "",
    locationType: "",
    cityName: "",
    lostItemType: "",
  });

  const fetchReports = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/blog/location-reports?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/blog/location-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          postId,
        }),
      });

      if (res.ok) {
        setHasSubmitted(true);
        setFormData({ locationName: "", locationType: "", cityName: "", lostItemType: "" });
        // Refresh reports
        await fetchReports();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengirim laporan lokasi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-bold">Peta Titik Rawan Kehilangan</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchReports}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Bantu sesama pembaca dengan melaporkan lokasi rawan kehilangan di sekitar Anda.
      </p>

      {/* Map Display */}
      <div className="mb-6 rounded-xl overflow-hidden border">
        <LeafletMap regionId={mapRegionId} reports={reports} />
      </div>

      {/* Report Form */}
      {hasSubmitted ? (
        <div className="text-center py-4 bg-emerald-50 rounded-lg">
          <p className="text-emerald-700 font-medium">Terima kasih! Laporan Anda telah tercatat.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lokasi *</Label>
              <Input
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="Contoh: Parkiran Stasiun Kandangan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Jenis Lokasi *</Label>
              <Select
                value={formData.locationType}
                onValueChange={(value) => setFormData({ ...formData, locationType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kota/Kabupaten *</Label>
              <Input
                value={formData.cityName}
                onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                placeholder="Contoh: Kandangan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Barang yang Hilang *</Label>
              <Input
                value={formData.lostItemType}
                onChange={(e) => setFormData({ ...formData, lostItemType: e.target.value })}
                placeholder="Contoh: Kunci Motor"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Mengirim..." : "Kirim Laporan Lokasi"}
          </Button>
        </form>
      )}

      {/* Recent Reports Summary */}
      {reports.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-2">Laporan Terbaru ({reports.length})</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            {reports.slice(0, 3).map((report) => (
              <div key={report.id} className="flex justify-between">
                <span>{report.locationName}, {report.cityName}</span>
                <span className="text-destructive">{report.lostItemType}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
