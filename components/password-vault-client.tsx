'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { ArrowLeft, Copy, Eye, EyeOff, KeyRound, LockKeyhole, Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createPasswordVaultItem, deletePasswordVaultItem, updatePasswordVaultItem } from '@/app/actions/password-vault';
import { decryptPasswordVaultEntry, encryptPasswordVaultEntry, type EncryptedPasswordVaultEntry, type PasswordVaultEntry } from '@/lib/password-vault-crypto';

type VaultItem = EncryptedPasswordVaultEntry & { id: string };
type FormState = PasswordVaultEntry;

const EMPTY_FORM: FormState = { name: '', username: '', password: '', url: '', notes: '' };
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const values = crypto.getRandomValues(new Uint32Array(24));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
}

export function PasswordVaultClient({ initialItems }: { initialItems: VaultItem[] }) {
  const [masterPassword, setMasterPassword] = useState('');
  const [unlockInput, setUnlockInput] = useState('');
  const [entries, setEntries] = useState<Record<string, FormState>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();
  const [lastActivity, setLastActivity] = useState(Date.now());

  const lock = () => {
    setUnlocked(false);
    setMasterPassword('');
    setUnlockInput('');
    setEntries({});
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setNotice('Vault dikunci.');
  };

  useEffect(() => {
    if (!unlocked) return;
    const timeout = window.setTimeout(lock, Math.max(1000, LOCK_TIMEOUT_MS - (Date.now() - lastActivity)));
    return () => window.clearTimeout(timeout);
  }, [unlocked, lastActivity]);

  const touch = () => setLastActivity(Date.now());

  const unlock = async () => {
    if (unlockInput.length < 8) {
      setError('Master password minimal 8 karakter.');
      return;
    }
    setError('');
    try {
      const decrypted: Record<string, FormState> = {};
      for (const item of initialItems) {
        decrypted[item.id] = await decryptPasswordVaultEntry(item, unlockInput);
      }
      setEntries(decrypted);
      setMasterPassword(unlockInput);
      setUnlockInput('');
      setUnlocked(true);
      setLastActivity(Date.now());
      setNotice(initialItems.length ? 'Vault terbuka.' : 'Vault siap digunakan.');
    } catch {
      setError('Master password salah atau data vault rusak.');
      setEntries({});
    }
  };

  const visibleItems = useMemo(() => initialItems.filter((item) => {
    const entry = entries[item.id];
    return entry && `${entry.name} ${entry.username} ${entry.url}`.toLowerCase().includes(search.toLowerCase());
  }), [entries, initialItems, search]);

  const selectItem = (id: string) => {
    touch(); setSelectedId(id); setForm(entries[id]); setShowPassword(false); setError('');
  };

  const startNew = () => {
    touch(); setSelectedId(null); setForm(EMPTY_FORM); setShowPassword(true); setError('');
  };

  const save = () => {
    touch(); setError('');
    if (!form.name.trim() || !form.password) { setError('Nama layanan dan password wajib diisi.'); return; }
    startTransition(async () => {
      try {
        const encrypted = await encryptPasswordVaultEntry(form, masterPassword);
        if (selectedId) await updatePasswordVaultItem({ id: selectedId, ...encrypted });
        else await createPasswordVaultItem(encrypted);
        window.location.reload();
      } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Gagal menyimpan item.'); }
    });
  };

  const remove = (id: string) => {
    if (!window.confirm('Hapus item password ini? Data tidak dapat dipulihkan.')) return;
    startTransition(async () => {
      try { await deletePasswordVaultItem(id); window.location.reload(); }
      catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus item.'); }
    });
  };

  const copy = async (value: string, label: string) => {
    touch();
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} disalin. Clipboard akan dikosongkan dalam 45 detik.`);
      window.setTimeout(() => navigator.clipboard.writeText('').catch(() => undefined), 45_000);
    } catch { setError('Clipboard tidak tersedia di browser ini.'); }
  };

  if (!unlocked) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900"><div className="container mx-auto px-4 py-4"><Link href="/dashboard"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Dashboard</Button></Link></div></header>
      <main className="container mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader className="text-center"><div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white"><LockKeyhole className="h-7 w-7" /></div><CardTitle>Password Vault</CardTitle><CardDescription>Master password hanya digunakan di perangkat ini untuk membuka enkripsi. Kami tidak menyimpannya.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label htmlFor="master-password">Master password</Label><Input id="master-password" type="password" value={unlockInput} onChange={(event) => setUnlockInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && unlock()} placeholder="Minimal 8 karakter" autoComplete="off" /></div>
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button className="w-full" onClick={unlock}><KeyRound className="mr-2 h-4 w-4" />Buka Vault</Button>
            <p className="text-xs leading-5 text-muted-foreground">Jika master password lupa, data terenkripsi tidak dapat dipulihkan oleh admin.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" onPointerDown={touch} onKeyDown={touch}>
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900"><div className="container mx-auto flex items-center justify-between gap-3 px-4 py-4"><Link href="/dashboard"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Button></Link><Button variant="outline" onClick={lock}><LockKeyhole className="mr-2 h-4 w-4" />Kunci Vault</Button></div></header>
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-brand-red">Private Vault</p><h1 className="text-3xl font-bold text-slate-900 dark:text-white">Password Manager</h1><p className="mt-1 text-sm text-muted-foreground">Data terenkripsi di browser dan otomatis dikunci setelah 5 menit tidak aktif.</p></div><Button onClick={startNew}><Plus className="mr-2 h-4 w-4" />Tambah Password</Button></div>
        {notice && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card><CardHeader><CardTitle className="text-base">Daftar Login</CardTitle><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari layanan..." /></CardHeader><CardContent className="space-y-2">{visibleItems.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada password.</p> : visibleItems.map((item) => <button key={item.id} type="button" onClick={() => selectItem(item.id)} className={`w-full rounded-lg border p-3 text-left ${selectedId === item.id ? 'border-brand-red bg-red-50 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}><p className="font-medium">{entries[item.id].name}</p><p className="truncate text-xs text-muted-foreground">{entries[item.id].username || 'Tanpa username'}</p></button>)}</CardContent></Card>
          <Card><CardHeader><CardTitle>{selectedId ? 'Edit Password' : 'Password Baru'}</CardTitle><CardDescription>Jangan masukkan data kartu atau password utama akun Balikin.</CardDescription></CardHeader><CardContent className="space-y-4">
            <div><Label htmlFor="vault-name">Nama layanan *</Label><Input id="vault-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Email kerja" /></div>
            <div><Label htmlFor="vault-username">Username atau email</Label><Input id="vault-username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="off" /></div>
            <div><Label htmlFor="vault-password">Password *</Label><div className="flex gap-2"><Input id="vault-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" /><Button type="button" variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, password: generatePassword() })}><RefreshCw className="h-4 w-4" /></Button></div></div>
            <div><Label htmlFor="vault-url">URL login</Label><Input id="vault-url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://" /></div>
            <div><Label htmlFor="vault-notes">Catatan</Label><Textarea id="vault-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} /></div>
            <div className="flex flex-wrap gap-2"><Button onClick={save} disabled={isPending}><ShieldCheck className="mr-2 h-4 w-4" />{isPending ? 'Menyimpan...' : 'Simpan Terenkripsi'}</Button>{selectedId && <><Button variant="outline" onClick={() => copy(form.username, 'Username')} disabled={!form.username}><Copy className="mr-2 h-4 w-4" />Copy Username</Button><Button variant="outline" onClick={() => copy(form.password, 'Password')}><Copy className="mr-2 h-4 w-4" />Copy Password</Button><Button variant="destructive" onClick={() => remove(selectedId)} disabled={isPending}><Trash2 className="mr-2 h-4 w-4" />Hapus</Button></>}</div>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}
