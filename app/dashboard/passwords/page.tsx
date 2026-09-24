import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getPasswordVaultSettings, listPasswordVaultItems } from '@/app/actions/password-vault';
import { PasswordVaultClient } from '@/components/password-vault-client';

export const dynamic = 'force-dynamic';

export default async function PasswordsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/sign-in?redirect=/dashboard/passwords');

  const [items, settings] = await Promise.all([listPasswordVaultItems(), getPasswordVaultSettings()]);
  return <PasswordVaultClient initialItems={items} vaultSalt={settings?.salt ?? null} />;
}
