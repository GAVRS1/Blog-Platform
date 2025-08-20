import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
  }, [queryClient]); // при инвалидации ['me'] будет перезапрос

  return { user };
}