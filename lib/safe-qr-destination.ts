const SLUG = '[A-Za-z0-9][A-Za-z0-9_-]{0,99}';

/** Accept only Balikin public-tag and activation links; never navigate to arbitrary QR destinations. */
export function getSafeQrDestination(raw: string, currentOrigin: string): string | null {
  const value = raw.trim();
  if (!value || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return null;

  let url: URL;
  try {
    url = new URL(value, currentOrigin);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.origin !== currentOrigin) return null;
  if (url.origin !== currentOrigin && !['balikin.online', 'www.balikin.online'].includes(url.hostname.toLowerCase())) return null;
  if (url.username || url.password || url.port) return null;
  const path = url.pathname;
  if (!new RegExp(`^/p/${SLUG}/?$`).test(path)
    && !new RegExp(`^/activate/${SLUG}/?$`).test(path)
    && !/^\/activate\/batch\/[0-9a-f-]{36}\/?$/i.test(path)
    && !new RegExp(`^/claim(?:/${SLUG})?/?$`).test(path)) return null;
  return `${path}${url.search}${url.hash}`;
}
