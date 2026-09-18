'use client';

import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { setClientPassword } from '@/app/actions/admin-client-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ClientPasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (password.length < 8 || password.length > 64) {
      setMessage({ type: 'error', text: 'Password harus terdiri dari 8 sampai 64 karakter.' });
      return;
    }

    if (password !== confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak sama.' });
      return;
    }

    setIsSubmitting(true);
    const result = await setClientPassword(userId, password);
    setIsSubmitting(false);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
      return;
    }

    setPassword('');
    setConfirmation('');
    setMessage({ type: 'success', text: 'Password user berhasil diganti.' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-new-password">Password Baru</Label>
          <Input
            id="client-new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={64}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-confirm-password">Konfirmasi Password</Label>
          <Input
            id="client-confirm-password"
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
