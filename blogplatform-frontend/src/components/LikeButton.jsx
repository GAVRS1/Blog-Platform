// src/components/LikeButton.jsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { likesService } from '@/services/likes';
import toast from 'react-hot-toast';

/**
 * Универсальная кнопка лайка.
 * type: 'post' | 'comment'
 */
export default function LikeButton({ type = 'post', targetId, initialLiked = false, initialCount = 0, className = '', onChange }) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(!!initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const onToggle = async () => {
    if (loading) return;
    setLoading(true);
    const prevLiked = liked;
    const prevCount = count;
    // оптимистично
    setLiked(!liked);
    setCount((c) => (prevLiked ? Math.max(0, c - 1) : c + 1));

    try {
      const res = type === 'post'
        ? await likesService.togglePost(targetId)
        : await likesService.toggleComment(targetId);
      setLiked(!!res.liked);
      setCount(res.count ?? prevCount);
      onChange?.(res);
      if (type === 'post') {
        await queryClient.invalidateQueries({ queryKey: ['feed'] });
      }
    } catch (e) {
      // откат
      setLiked(prevLiked);
      setCount(prevCount);
      const status = e.response?.status;
      if (status === 403) toast.error('Действие запрещено настройками приватности/блокировками');
      else toast.error(e.response?.data || 'Не удалось поставить лайк');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`btn btn-sm ${liked ? 'btn-error' : 'btn-ghost'} ${className}`}
      disabled={loading}
      title={liked ? 'Убрать лайк' : 'Лайкнуть'}
    >
      <span className="flex items-center gap-2">
        <span role="img" aria-label={liked ? 'Лайк' : 'Лайк'}>
          ❤️
        </span>
        <span>{count}</span>
      </span>
    </button>
  );
}
