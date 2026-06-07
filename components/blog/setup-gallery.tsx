"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImagePlus, CheckCircle2 } from "lucide-react";
import { ImageUploader } from "./image-uploader";

interface GalleryPhoto {
  id: string;
  userName: string;
  photoUrl: string;
  description: string | null;
  discountCode: string | null;
  createdAt: string;
}

interface SetupGalleryProps {
  galleryId: string;
  postId: string;
  incentiveDiscount: number;
}

export function BlogSetupGallery({ galleryId, postId, incentiveDiscount }: SetupGalleryProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    photoUrl: "",
    description: "",
  });

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/blog/setup-gallery/${galleryId}?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error("Failed to fetch gallery photos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [galleryId, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/blog/setup-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          postId,
          galleryId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHasSubmitted(true);
        setFormData({ userName: "", userEmail: "", photoUrl: "", description: "" });
        // Refresh gallery
        await fetchPhotos();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengirim foto setup.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 md:p-8 my-8">
        <p className="text-center text-muted-foreground">Loading gallery...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 my-8">
      <div className="flex items-center gap-2 mb-4">
        <ImagePlus className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Galeri Setup BALIKIN</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Bagikan foto setup BALIKIN kamu dan dapatkan diskon {incentiveDiscount}% untuk pembelian berikutnya!
      </p>

      {/* Gallery Display */}
      {photos.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photoUrl}
                  alt={`Setup by ${photo.userName}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-3 flex flex-col justify-end">
                  <p className="text-white text-sm font-medium">{photo.userName}</p>
                  {photo.description && (
                    <p className="text-white/80 text-xs">{photo.description}</p>
                  )}
                  {photo.discountCode && (
                    <p className="text-emerald-300 text-xs font-mono mt-1">{photo.discountCode}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Form */}
      {hasSubmitted ? (
        <div className="text-center py-6 bg-emerald-50 rounded-lg">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <p className="text-emerald-700 font-medium">Terima kasih! Foto setup Anda telah terkirim.</p>
          <p className="text-emerald-600 text-sm mt-1">Admin akan memverifikasi dan mengirimkan kode diskon via WhatsApp.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama *</Label>
              <Input
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Nama lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                placeholder="Untuk kiriman kode diskon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Foto Setup *</Label>
            <ImageUploader
              value={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
            />
          </div>

          <div className="space-y-2">
            <Label>Deskripsi (Optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ceritakan tentang setup BALIKIN kamu..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !formData.photoUrl} className="w-full">
            {isSubmitting ? "Mengirim..." : `Kirim & Dapatkan Diskon ${incentiveDiscount}%`}
          </Button>
        </form>
      )}
    </Card>
  );
}
