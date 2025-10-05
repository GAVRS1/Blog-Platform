// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';

export function useAuth() {
  // undefined — загрузка; null — не залогинен; object — пользователь
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    authService.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);

  return { user, setUser };
}
