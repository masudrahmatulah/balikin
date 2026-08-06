"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateTagGreetingTemplate } from "@/app/actions/site-settings";
import { DEFAULT_TAG_GREETING_TEMPLATE } from "@/lib/site-settings-defaults";

interface TagGreetingSettingsFormProps {
  initialTemplate: string;
}

export function TagGreetingSettingsForm({ initialTemplate }: TagGreetingSettingsFormProps) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const previewName = "Budi Santoso";
  const previewText = template.replaceAll("{{ownerName}}", previewName || "{{ownerName}}");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    const result = await updateTagGreetingTemplate(template);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    setTemplate(DEFAULT_TAG_GREETING_TEMPLATE);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesan Sambutan Halaman Tag</CardTitle>
        <CardDescription>
          Pesan ini tampil di halaman publik tag (/p/[slug]) saat status tag normal (tidak hilang).
          Gunakan <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">{"{{ownerName}}"}</code> untuk menyisipkan nama pemilik akun tag secara otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="tag-greeting-template" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Template Pesan
          </label>
          <Textarea
            id="tag-greeting-template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={4}
            maxLength={1000}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {template.length}/1000 karakter
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Preview (contoh nama: {previewName})
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{previewText}</p>
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

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isSaving} type="button">
            Reset ke Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
