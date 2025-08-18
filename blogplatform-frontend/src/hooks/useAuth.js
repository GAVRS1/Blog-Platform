// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import api from '@/api/axios';

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/users/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return { user };
}