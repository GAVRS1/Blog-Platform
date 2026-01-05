// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';
import { AUTH_TOKEN_COOKIE, removeCookie } from '@/utils/cookies';

export function useAuth() {
  // undefined — загрузка; null — не залогинен; object — пользователь
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let active = true;

    authService.me()
      .then((u) => { if (active) setUser(u); })
      .catch((error) => {
        if (active) {
          if (error?.response?.status === 401) {
            // best effort очистка токена, если доступен
            removeCookie(AUTH_TOKEN_COOKIE, { path: '/' });
          }
          setUser(null);
        }
      });
    return () => { active = false; };
  }, []);

  return { user, setUser };
}
