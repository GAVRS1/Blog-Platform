import { useCallback, useSyncExternalStore } from 'react';
import { AUTH_TOKEN_COOKIE, getCookie, removeCookie, setCookie } from '@/utils/cookies';

export const CONSENT_COOKIE = 'cookie_consent';

const listeners = new Set();

const canUseDocument = typeof document !== 'undefined';

function readConsentCookie() {
  if (!canUseDocument) return 'pending';
  const raw = getCookie(CONSENT_COOKIE);
  if (raw === 'accepted' || raw === 'declined') return raw;
  return 'pending';
}

let consentState = readConsentCookie();

function emitChange() {
  listeners.forEach((cb) => cb());
}

function setConsentState(next) {
  consentState = next;
  emitChange();
}

function clearSessionCookies() {
  if (!canUseDocument) return;
  const pairs = document.cookie ? document.cookie.split('; ') : [];
  for (const pair of pairs) {
    const [rawName] = pair.split('=');
    const name = decodeURIComponent(rawName);
    if (!name || name === CONSENT_COOKIE) continue;
    removeCookie(name, { path: '/' });
  }
  removeCookie(AUTH_TOKEN_COOKIE, { path: '/' });
}

export function getConsentState() {
  return consentState;
}

export function useCookieConsent() {
  const status = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => consentState,
    () => consentState
  );

  const accept = useCallback(() => {
    if (!canUseDocument) return;
    setCookie(CONSENT_COOKIE, 'accepted', {
      days: 365,
      path: '/',
      sameSite: 'Lax',
    });
    setConsentState('accepted');
  }, []);

  const decline = useCallback(() => {
    if (!canUseDocument) return;
    setCookie(CONSENT_COOKIE, 'declined', {
      days: 365,
      path: '/',
      sameSite: 'Lax',
    });
    clearSessionCookies();
    setConsentState('declined');
  }, []);

  return { status, accept, decline };
}
