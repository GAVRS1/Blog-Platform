import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount((c) => (liked ? c - 1 : c + 1));

    try {
      const { data } = await api.post(`/likes/post/${postId}`);
      setLiked(data.liked);
      setCount(data.count);
    } catch {
      toast.error('Не удалось поставить лайк');
      setLiked(prevLiked);
      setCount(prevCount);
    }
  };

  return (
    <motion.button
      className={`like-btn ${liked ? 'liked' : ''}`}
      onClick={toggleLike}
      whileTap={{ scale: 1.2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <span>{liked ? '❤️' : '🤍'}</span> {count}
    </motion.button>
  );
}