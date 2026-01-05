// Simple cookie helper for setting, reading and removing cookies with sane defaults.
// If the backend issues httpOnly cookies, JS won't be able to read or clear them,
// but these helpers still work for client-managed tokens.

const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:';

function buildOptions(options = {}) {
  const {
    days = 7,
    path = '/',
    secure = isSecureContext,
    sameSite = 'Lax',
    domain,
    expires,
  } = options;

  const parts = [];
  parts.push(`path=${path}`);

  if (domain) parts.push(`domain=${domain}`);
  if (expires instanceof Date) {
    parts.push(`expires=${expires.toUTCString()}`);
  } else if (typeof days === 'number') {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    parts.push(`expires=${date.toUTCString()}`);
  }

  if (sameSite) parts.push(`SameSite=${sameSite}`);
  if (secure) parts.push('Secure');

  return parts.join('; ');
}

export function setCookie(name, value, options = {}) {
  const optString = buildOptions(options);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${optString}`;
}

export function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const target = encodeURIComponent(name);
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.split('=');
    if (rawName === target) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
}

export function removeCookie(name, options = {}) {
  // Must use the same path/domain to delete correctly
  const { path = '/', domain } = options;
  document.cookie = `${encodeURIComponent(name)}=; path=${path};${domain ? ` domain=${domain};` : ''} expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export const AUTH_TOKEN_COOKIE = 'token';
