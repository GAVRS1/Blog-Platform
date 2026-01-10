import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { connectRealtime } from '@/realtime';
import {
  emitRealtimeMessage,
  emitRealtimeNotification,
  emitRealtimePresence,
  emitRealtimeReads,
  emitRealtimeStatus
} from '@/realtimeEvents';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_TOKEN_COOKIE, getCookie } from '@/utils/cookies';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const PUBLIC = ['/login', '/register', '/verify', '/appeal', '/404'];
const normalizeMessage = (message) => {
  if (!message) return message;
  if (!message.createdAt && message.sentAt) {
    return { ...message, createdAt: message.sentAt };
  }
  return message;
};

export default function RealtimeMount() {
  const ref = useRef(null);
  const loc = useLocation();
  const { user } = useAuth();
  const { status } = useCookieConsent();

  useEffect(() => {
    if (user === undefined || status !== 'accepted') {
      if (ref.current) {
        ref.current.stop();
        ref.current = null;
      }
      return;
    }

    const token = getCookie(AUTH_TOKEN_COOKIE);
    const isPublic = PUBLIC.some(p => loc.pathname.startsWith(p));
    const hasSession = Boolean(token || user);

    if (!hasSession || isPublic) {
      // если уже было соединение — останавливаем при уходе на публичную страницу
      if (ref.current) {
        ref.current.stop();
        ref.current = null;
      }
      return;
    }

    if (!ref.current) {
      ref.current = connectRealtime(
        token,
        {
          onMessage: (m) => emitRealtimeMessage(normalizeMessage(m)),
          onNotification: (n) => emitRealtimeNotification(n),
          onStatus: emitRealtimeStatus,
          onPresence: emitRealtimePresence,
          onReads: (payload) => emitRealtimeReads(payload),
        },
        { currentUserId: user?.id }
      );
      ref.current.start();
    }

    return () => {
      // размонтаж компонента (смена роутера) — корректно гасим
      if (ref.current && PUBLIC.some(p => loc.pathname.startsWith(p))) {
        ref.current.stop();
        ref.current = null;
      }
    };
  }, [loc.pathname, status, user]);

  return null;
}
