import { API_BASE, API_PREFIX } from '@/api/config';

const ABSOLUTE_URL_REGEX = /^[a-z][a-z0-9+.-]*:|^\/\//i;

export function resolveMediaUrl(mediaUrl) {
  if (!mediaUrl) return null;

  const trimmed = mediaUrl.toString().trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (ABSOLUTE_URL_REGEX.test(trimmed)) {
    try {
      return new URL(trimmed, window.location.origin).href;
    } catch {
      return trimmed;
    }
  }

  const cleaned = trimmed.replace(/\\/g, '/');
  const base = API_BASE || '';
  const apiPrefix = (API_PREFIX || '/api').replace(/\/+$/, '');

  if (cleaned.startsWith(`${apiPrefix}/uploads`)) {
    return `${base}${cleaned.replace(apiPrefix, '')}`;
  }

  if (cleaned.startsWith('/uploads')) {
    return `${base}${cleaned}`;
  }

  if (cleaned.startsWith('uploads/')) {
    return `${base}/${cleaned}`;
  }

  const normalized = cleaned.replace(/^\/+/, '');
  return `${base}/uploads/${normalized}`;
}
