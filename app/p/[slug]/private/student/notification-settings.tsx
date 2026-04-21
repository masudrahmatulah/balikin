'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, Loader2 } from 'lucide-react';
import { updateStudentKitNotificationSettings } from '@/app/actions/modules';

interface NotificationSettingsProps {
  initialEnabled: boolean;
  initialPhoneNumber: string | null;
}

export function NotificationSettings({
  initialEnabled,
  initialPhoneNumber,
}: NotificationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setLastSaved(false);

    try {
      await updateStudentKitNotificationSettings({
        whatsappNotificationsEnabled: isEnabled,
        notificationPhoneNumber: phoneNumber || undefined,
      });

      setLastSaved(true);
      setTimeout(() => setLastSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Quick Toggle Button */}
      {!isOpen && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Notifikasi Deadline WhatsApp
                  </p>
                  <p className="text-xs text-gray-500">
                    {isEnabled ? 'Aktif' : 'Nonaktif'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Settings Modal */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Pengaturan Notifikasi WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                Dapatkan pengingat otomatis untuk tugas yang akan deadline dalam
                24 jam. Notifikasi dikirim pukul 08:00 dan 20:00 setiap hari.
              </p>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label htmlFor="notifications-toggle" className="text-base font-medium">
                  Aktifkan Notifikasi
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Terima pengingat deadline via WhatsApp
                </p>
              </div>
              <Switch
                id="notifications-toggle"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            {/* Phone Number Input */}
            {isEnabled && (
              <div className="space-y-2">
                <Label htmlFor="phone-number">Nomor WhatsApp</Label>
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  type="tel"
                />
                <p className="text-xs text-gray-500">
                  Nomor WhatsApp untuk menerima notifikasi (biarkan kosong untuk
                  menggunakan nomor akun)
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Pastikan nomor WhatsApp Anda terdaftar
                di Fonnte dan memiliki saldo yang cukup untuk mengirim pesan.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Tutup
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : lastSaved ? (
                  <>
                    ✓ Tersimpan
                  </>
                ) : (
                  'Simpan Pengaturan'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
