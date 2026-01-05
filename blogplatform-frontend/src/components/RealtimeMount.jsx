import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { connectRealtime } from '@/realtime';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_TOKEN_COOKIE, getCookie } from '@/utils/cookies';

const PUBLIC = ['/login', '/register', '/verify', '/appeal', '/404'];

export default function RealtimeMount() {
  const ref = useRef(null);
  const loc = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user === undefined) return;

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
      ref.current = connectRealtime(token, {
        onMessage: () => {},
        onNotification: () => {},
        onStatus: () => {},
      });
      ref.current.start();
    }

    return () => {
      // размонтаж компонента (смена роутера) — корректно гасим
      if (ref.current && PUBLIC.some(p => loc.pathname.startsWith(p))) {
        ref.current.stop();
        ref.current = null;
      }
    };
  }, [loc.pathname, user]);

  return null;
}
