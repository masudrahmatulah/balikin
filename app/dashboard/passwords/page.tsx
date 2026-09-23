import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { listPasswordVaultItems } from '@/app/actions/password-vault';
import { PasswordVaultClient } from '@/components/password-vault-client';

export const dynamic = 'force-dynamic';

export default async function PasswordsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/sign-in?redirect=/dashboard/passwords');

  const items = await listPasswordVaultItems();
  return <PasswordVaultClient initialItems={items} />;
}
