'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, MapPin, MessageCircle, Pencil, Trash2, Check, X, Gift, Crown } from 'lucide-react';
import { updateTagStatus, updateTag, deleteTag } from '@/app/actions/tag';
import { useRouter } from 'next/navigation';
import { VerifiedBadge } from '@/components/verified-badge';
import { FREE_TAG_LIMIT } from '@/lib/constants';

interface TagCardProps {
  id: string;
  slug: string;
  name: string;
  status: string;
  contactWhatsapp: string | null;
  customMessage: string | null;
  rewardNote: string | null;
  tier?: string | null;
  isVerified?: boolean | null;
  createdAt: Date | null;
  scanCount?: number;
}

export function TagCard({
  id,
  slug,
  name,
  status,
  contactWhatsapp,
  customMessage,
  rewardNote,
  tier,
  isVerified,
  createdAt,
  scanCount = 0,
}: TagCardProps) {
  const router = useRouter();
  const isLost = status === 'lost';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editWhatsapp, setEditWhatsapp] = useState(contactWhatsapp || '');
  const [editMessage, setEditMessage] = useState(customMessage || '');
  const [editReward, setEditReward] = useState(rewardNote || '');

  const handleStatusToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      await updateTagStatus(id, checked ? 'lost' : 'normal');
      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Gagal mengupdate status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateTag(id, {
        name: editName,
        contactWhatsapp: editWhatsapp,
        customMessage: editMessage,
        rewardNote: editReward,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update tag:', error);
      alert('Gagal mengupdate tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus tag ini?')) return;

    setIsLoading(true);
    try {
      await deleteTag(id);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Gagal menghapus tag');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <Card className={isLost ? 'border-red-200' : ''}>
        <CardHeader>
          <CardTitle>Edit Tag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nama Tag</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-whatsapp">Nomor WhatsApp</Label>
            <Input
              id="edit-whatsapp"
              value={editWhatsapp}
              onChange={(e) => setEditWhatsapp(e.target.value)}
              placeholder="628123456789"
            />
          </div>
          <div>
            <Label htmlFor="edit-message">Pesan Personal</Label>
            <Textarea
              id="edit-message"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              placeholder="Contoh: Kunci motor ini sangat penting bagi saya..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-reward">Imbalan (opsional)</Label>
            <Input
              id="edit-reward"
              value={editReward}
              onChange={(e) => setEditReward(e.target.value)}
              placeholder="Contoh: Rp 50.000"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Check className="mr-2 h-4 w-4" />
            Simpan
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={isLost ? 'border-red-200 shadow-sm' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
              <span>/p/{slug}</span>
              <VerifiedBadge
                tier={tier as 'free' | 'premium' | null}
                isVerified={isVerified}
                size="sm"
              />
            </CardDescription>
          </div>
          <Badge variant={isLost ? 'destructive' : 'success'}>
            {isLost ? 'Hilang' : 'Normal'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLost && (
          <Alert variant="destructive">
            <Gift className="h-4 w-4" />
            <AlertDescription>
              {rewardNote ? `Imbalan: ${rewardNote}` : 'Status: HILANG'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <Label htmlFor={`toggle-${id}`} className="cursor-pointer">
              Status Hilang
            </Label>
          </div>
          <Switch
            id={`toggle-${id}`}
            checked={isLost}
            onCheckedChange={handleStatusToggle}
            disabled={isLoading}
          />
        </div>

        {customMessage && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Pesan:</p>
            {customMessage}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageCircle className="h-4 w-4" />
          <span>{contactWhatsapp || 'Belum diisi'}</span>
        </div>

        {scanCount > 0 && (
          <div className="text-xs text-gray-500">
            {scanCount} scan tercatat
          </div>
        )}

        {/* Upsell for Free Tier */}
        {tier === 'free' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Upgrade ke Premium</p>
                    <p className="text-xs text-amber-700">Gantungan kunci fisik Rp35rb</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => window.open('https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20upgrade%20tag%20ke%20Premium', '_blank')}
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isLoading}>
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isLoading}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
