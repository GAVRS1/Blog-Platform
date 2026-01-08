// src/components/BlockButton.jsx
import { useEffect, useState } from 'react';
import { blocksService } from '@/services/blocks';
import toast from 'react-hot-toast';

export default function BlockButton({ userId, className = '' }) {
  const [state, setState] = useState({
    loading: true,
    iBlocked: false,
    blockedMe: false,
    unavailable: false
  });

  async function load() {
    try {
      const rel = await blocksService.relationship(userId);
      setState({ loading: false, unavailable: false, ...rel });
    } catch (err) {
      if (err.response?.status === 404) {
        setState({ loading: false, iBlocked: false, blockedMe: false, unavailable: true });
        return;
      }
      setState((s) => ({ ...s, loading: false }));
    }
  }

  useEffect(() => { load(); }, [userId]);

  const block = async () => {
    try {
      await blocksService.block(userId);
      toast.success('Пользователь заблокирован');
      await load();
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось заблокировать');
    }
  };

  const unblock = async () => {
    try {
      await blocksService.unblock(userId);
      toast.success('Пользователь разблокирован');
      await load();
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось разблокировать');
    }
  };

  if (state.loading) {
    return <button className={`btn btn-sm btn-ghost ${className}`} disabled>...</button>;
  }

  if (state.unavailable) {
    return null;
  }

  if (state.iBlocked) {
    return (
      <button className={`btn btn-sm btn-warning ${className}`} onClick={unblock}>
        Разблокировать
      </button>
    );
  }

  return (
    <button className={`btn btn-sm btn-outline ${className}`} onClick={block}>
      Заблокировать
    </button>
  );
}
