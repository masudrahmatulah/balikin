'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, User, Mail, Phone, Globe, FileText } from 'lucide-react';
import { updateInternshipVCard } from '@/app/actions/modules';

interface VCardData {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  bio?: string;
}

interface InternshipVCardFormProps {
  initialData: VCardData | null;
  mode: 'create' | 'edit';
}

export function InternshipVCardForm({ initialData, mode }: InternshipVCardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<VCardData>(
    initialData || {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      portfolioUrl: '',
      githubUrl: '',
      bio: '',
    }
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateInternshipVCard(formData);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menyimpan vCard');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant={mode === 'create' ? 'default' : 'outline'}>
        {mode === 'create' ? (
          <>
            <User className="w-4 h-4 mr-2" />
            Buat vCard
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Edit vCard
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Buat Internship vCard' : 'Edit Internship vCard'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Informasi Dasar
          </Label>

          <div>
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input
              id="fullName"
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="title">Judul / Posisi</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Mahasiswa Teknik Informatika"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio Singkat</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Deskripsikan diri Anda secara singkat..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio?.length || 0} / 500 karakter
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Kontak
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 812 3456 7890"
              />
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Link Profesional
          </Label>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 inline-block text-center">💼</span>
              <Input
                value={formData.linkedinUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="LinkedIn URL"
              />
            </div>

            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" />
              <Input
                value={formData.portfolioUrl || ''}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="Portfolio URL"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 inline-block text-center">⚡</span>
              <Input
                value={formData.githubUrl || ''}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="GitHub URL"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.fullName}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan vCard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
