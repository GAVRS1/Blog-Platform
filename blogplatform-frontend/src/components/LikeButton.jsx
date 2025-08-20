import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // Синхронизация с пропсами при изменении
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/likes/post/${postId}`),
    onMutate: () => {
      // Optimistic update
      const prevLiked = liked;
      const prevCount = count;
      
      setLiked(!liked);
      setCount(prev => liked ? prev - 1 : prev + 1);
      setIsAnimating(true);
      
      return { prevLiked, prevCount };
    },
    onSuccess: (res) => {
      // Синхронизация с сервером
      setLiked(res.data.liked);
      setCount(res.data.count || count);
      
      // Инвалидация кеша
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['post', postId]);
      
      setTimeout(() => setIsAnimating(false), 300);
    },
    onError: (error, variables, context) => {
      // Откат изменений при ошибке
      if (context) {
        setLiked(context.prevLiked);
        setCount(context.prevCount);
      }
      setIsAnimating(false);
      
      const message = error.response?.data?.message || 'Не удалось обновить лайк';
      toast.error(message);
    },
  });

  const handleClick = () => {
    if (!likeMutation.isPending) {
      likeMutation.mutate();
    }
  };

  return (
    <motion.button
      className={`btn btn-ghost btn-sm gap-2 transition-all duration-200 ${
        liked ? 'text-red-500 hover:text-red-600' : 'text-base-content/60 hover:text-red-500'
      } ${likeMutation.isPending ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={likeMutation.isPending}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="text-lg"
        animate={isAnimating ? { 
          scale: [1, 1.3, 1],
          rotate: liked ? [0, -10, 10, 0] : [0, 10, -10, 0]
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {liked ? '❤️' : '🤍'}
      </motion.span>
      
      <motion.span 
        className="font-medium"
        key={count}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {count}
      </motion.span>
      
      {likeMutation.isPending && (
        <motion.div
          className="loading loading-spinner loading-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.button>
  );
}
