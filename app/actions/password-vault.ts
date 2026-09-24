'use server';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordVaultItems, passwordVaultSettings } from '@/db/schema';
import { requireAuth } from '@/lib/session';

const MAX_CIPHERTEXT_LENGTH = 200_000;

function validateEncryptedField(value: unknown, name: string) {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_CIPHERTEXT_LENGTH) {
    throw new Error(`${name} tidak valid`);
  }
  return value;
}

export async function getPasswordVaultSettings() {
  const session = await requireAuth();
  return db.query.passwordVaultSettings.findFirst({
    where: and(
      eq(passwordVaultSettings.userId, session.user.id),
      eq(passwordVaultSettings.app_id, 'balikin_id'),
    ),
    columns: { salt: true },
  });
}

export async function createPasswordVaultSettings(input: { verifier: string; salt: string }) {
  const session = await requireAuth();
  const verifier = validateEncryptedField(input.verifier, 'Verifier');
  const salt = validateEncryptedField(input.salt, 'Salt');
  const existing = await db.query.passwordVaultSettings.findFirst({
    where: and(eq(passwordVaultSettings.userId, session.user.id), eq(passwordVaultSettings.app_id, 'balikin_id')),
    columns: { id: true },
  });
  if (existing) throw new Error('Master password sudah dibuat');
  await db.insert(passwordVaultSettings).values({ userId: session.user.id, verifier, salt });
  return { success: true };
}

export async function verifyPasswordVaultSettings(verifier: string) {
  const session = await requireAuth();
  const settings = await db.query.passwordVaultSettings.findFirst({
    where: and(eq(passwordVaultSettings.userId, session.user.id), eq(passwordVaultSettings.app_id, 'balikin_id')),
    columns: { verifier: true },
  });
  return { valid: Boolean(settings && settings.verifier === verifier) };
}

export async function changePasswordVaultSettings(input: { verifier: string; salt: string }) {
  const session = await requireAuth();
  await db.update(passwordVaultSettings).set({
    verifier: validateEncryptedField(input.verifier, 'Verifier'),
    salt: validateEncryptedField(input.salt, 'Salt'),
    updatedAt: new Date(),
  }).where(and(
    eq(passwordVaultSettings.userId, session.user.id),
    eq(passwordVaultSettings.app_id, 'balikin_id'),
  ));
  return { success: true };
}

export async function listPasswordVaultItems() {
  const session = await requireAuth();
  return db.query.passwordVaultItems.findMany({
    where: and(
      eq(passwordVaultItems.userId, session.user.id),
      eq(passwordVaultItems.app_id, 'balikin_id'),
    ),
    columns: {
      id: true,
      ciphertext: true,
      iv: true,
      salt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [desc(passwordVaultItems.updatedAt)],
  });
}

export async function createPasswordVaultItem(input: {
  ciphertext: string;
  iv: string;
  salt: string;
}) {
  const session = await requireAuth();
  const [item] = await db.insert(passwordVaultItems).values({
    userId: session.user.id,
    ciphertext: validateEncryptedField(input.ciphertext, 'Ciphertext'),
    iv: validateEncryptedField(input.iv, 'IV'),
    salt: validateEncryptedField(input.salt, 'Salt'),
  }).returning({ id: passwordVaultItems.id });
  return item;
}

export async function updatePasswordVaultItem(input: {
  id: string;
  ciphertext: string;
  iv: string;
  salt: string;
}) {
  const session = await requireAuth();
  if (!/^[0-9a-f-]{36}$/i.test(input.id)) throw new Error('Item tidak valid');
  await db.update(passwordVaultItems).set({
    ciphertext: validateEncryptedField(input.ciphertext, 'Ciphertext'),
    iv: validateEncryptedField(input.iv, 'IV'),
    salt: validateEncryptedField(input.salt, 'Salt'),
    updatedAt: new Date(),
  }).where(and(
    eq(passwordVaultItems.id, input.id),
    eq(passwordVaultItems.userId, session.user.id),
    eq(passwordVaultItems.app_id, 'balikin_id'),
  ));
  return { success: true };
}

export async function deletePasswordVaultItem(id: string) {
  const session = await requireAuth();
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Item tidak valid');
  await db.delete(passwordVaultItems).where(and(
    eq(passwordVaultItems.id, id),
    eq(passwordVaultItems.userId, session.user.id),
    eq(passwordVaultItems.app_id, 'balikin_id'),
  ));
  return { success: true };
}
