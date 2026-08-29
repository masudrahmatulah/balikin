import { FREE_TAG_TRIAL_DAYS } from '@/lib/constants';

type TagExpirationInput = {
  tier?: string | null;
  expiresAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export function getTagExpirationDate(tag: TagExpirationInput): Date | null {
  if (tag.tier === 'premium') return null;
  if (tag.expiresAt) return new Date(tag.expiresAt);
  if (!tag.createdAt) return null;

  return new Date(new Date(tag.createdAt).getTime() + FREE_TAG_TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

export function isTagExpired(tag: TagExpirationInput): boolean {
  const expirationDate = getTagExpirationDate(tag);
  return expirationDate !== null && expirationDate <= new Date();
}
