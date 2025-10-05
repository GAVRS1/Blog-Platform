// src/components/RealtimeMount.jsx
import { useEffect, useRef } from 'react';
import { connectRealtime } from '@/realtime';

export default function RealtimeMount() {
  const ref = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    ref.current = connectRealtime(token, {
      onMessage: () => {},
      onNotification: () => {}
    });
    ref.current.start();

    return () => {
      ref.current?.stop();
      ref.current = null;
    };
  }, []);

  return null;
}