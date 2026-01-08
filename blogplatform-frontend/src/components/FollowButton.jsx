// src/components/FollowButton.jsx
import { useEffect, useState } from 'react';
import { followsService } from '@/services/follows';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function FollowButton({ userId, className = '' }) {
  const { user: currentUser } = useAuth();
  const [state, setState] = useState({ loading: true, iFollow: false, followsMe: false, areFriends: false });

  async function load() {
    try {
      const rel = await followsService.relationship(userId);
      setState({ loading: false, ...rel });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }

  useEffect(() => { load(); }, [userId]);

  const follow = async () => {
    try {
      await followsService.follow(userId);
      toast.success('Вы подписались');
      await load();
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось подписаться');
    }
  };

  const unfollow = async () => {
    try {
      await followsService.unfollow(userId);
      toast.success('Вы отписались');
      await load();
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось отписаться');
    }
  };

  if (currentUser && userId === currentUser.id) {
    return <span className={`badge badge-ghost ${className}`}>Это вы</span>;
  }

  if (state.loading) {
    return <button className={`btn btn-sm btn-ghost ${className}`} disabled>...</button>;
  }

  if (state.areFriends) {
    return (
      <div className={`badge badge-success gap-2 py-3 ${className}`}>
        <i className="fas fa-user-friends"></i> Друзья
        <button className="btn btn-xs btn-ghost ml-2" onClick={unfollow}>Отписаться</button>
      </div>
    );
  }

  if (state.iFollow) {
    return (
      <button className={`btn btn-sm btn-outline ${className}`} onClick={unfollow}>
        Отписаться
      </button>
    );
  }

  return (
    <button className={`btn btn-sm btn-primary ${className}`} onClick={follow}>
      Подписаться
    </button>
  );
}
