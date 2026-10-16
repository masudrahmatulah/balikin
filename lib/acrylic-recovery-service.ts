import { acrylicRecoveryBlockReason, type AcrylicRecoveryRecord } from './acrylic-support-policy';

export function redactAcrylicAuditNote(note: string, pin: string): string {
  const escapedPin = pin.replace(/[-\s]/g, '').split('').map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s-]*');
  const redacted = escapedPin ? note.replace(new RegExp(escapedPin, 'gi'), '[REDACTED]') : note;
  return redacted
    .replace(/\b[A-Fa-f0-9]{64}\b/gi, '[REDACTED]')
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, '[REDACTED]');
}

export async function releaseAcrylicCard<T>(input: {
  record: AcrylicRecoveryRecord;
  writeAudit: () => Promise<void>;
  buildPdf: () => Promise<T>;
}): Promise<{ ok: true; pdf: T } | { ok: false; reason: string }> {
  const reason = acrylicRecoveryBlockReason(input.record);
  if (reason) return { ok: false, reason };
  await input.writeAudit();
  return { ok: true, pdf: await input.buildPdf() };
}
