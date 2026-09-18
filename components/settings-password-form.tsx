'use client';

import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SettingsPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (newPassword.length < 8 || newPassword.length > 64) {
      setMessage({ type: 'error', text: 'Password baru harus terdiri dari 8 sampai 64 karakter.' });
      return;
    }

    if (newPassword !== confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak sama.' });
      return;
    }

    setIsSubmitting(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setIsSubmitting(false);

    if (result.error) {
      setMessage({ type: 'error', text: result.error.message || 'Password lama tidak valid.' });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setMessage({ type: 'success', text: 'Password berhasil diganti.' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Password Saat Ini</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">Password Baru</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={64}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={64}
            required
          />
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {isSubmitting ? 'Menyimpan...' : 'Ganti Password'}
      </Button>
    </form>
  );
}
