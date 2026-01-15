import { useCallback, useSyncExternalStore } from 'react';
import { getCookie, setCookie } from '@/utils/cookies';

export const CONSENT_COOKIE = 'cookie_consent';

const listeners = new Set();

const canUseDocument = typeof document !== 'undefined';

function readConsentCookie() {
  if (!canUseDocument) return 'pending';
  const raw = getCookie(CONSENT_COOKIE);
  if (raw === 'accepted' || raw === 'declined') return 'accepted';
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

  return { status, accept };
}
