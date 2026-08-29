"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAdminWhatsappNumber } from "@/app/actions/site-settings";

interface WhatsappSettingsFormProps {
  initialNumber: string | null;
}

export function WhatsappSettingsForm({ initialNumber }: WhatsappSettingsFormProps) {
  const router = useRouter();
  const [number, setNumber] = useState(initialNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    const result = await updateAdminWhatsappNumber(number);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nomor WhatsApp Admin</CardTitle>
        <CardDescription>
          Nomor WhatsApp yang akan menerima notifikasi pesanan stiker baru.
          Kosongkan untuk menggunakan nomor default dari variabel lingkungan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="admin-whatsapp-number">Nomor WhatsApp</Label>
          <Input
            id="admin-whatsapp-number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="6281234567890"
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: 628... (tanpa + atau 0 di depan)
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div role="status" className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">Pengaturan berhasil disimpan.</p>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </CardContent>
    </Card>
  );
}