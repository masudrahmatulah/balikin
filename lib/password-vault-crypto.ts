export interface PasswordVaultEntry {
  name: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface EncryptedPasswordVaultEntry {
  ciphertext: string;
  iv: string;
  salt: string;
}

const PBKDF2_ITERATIONS = 310_000;

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function deriveKey(masterPassword: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptPasswordVaultEntry(entry: PasswordVaultEntry, masterPassword: string): Promise<EncryptedPasswordVaultEntry> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterPassword, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(entry)),
  );
  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
  };
}

export async function decryptPasswordVaultEntry(item: EncryptedPasswordVaultEntry, masterPassword: string): Promise<PasswordVaultEntry> {
  const salt = base64ToBytes(item.salt);
  const iv = base64ToBytes(item.iv);
  const key = await deriveKey(masterPassword, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    base64ToBytes(item.ciphertext),
  );
  const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as PasswordVaultEntry;
  if (!parsed || typeof parsed.name !== 'string' || typeof parsed.password !== 'string') {
    throw new Error('Data vault tidak valid');
  }
  return parsed;
}
