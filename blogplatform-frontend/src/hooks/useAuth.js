// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import api from '@/api/axios';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = ещё не знаем

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);          // явно «не залогинен»
      return;
    }

    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);

  return { user };   // undefined | null | User
}