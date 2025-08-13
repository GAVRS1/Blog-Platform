import { useState } from 'react';
import api from '../api/axios';

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggleLike = async () => {
    try {
      const res = await api.post(`/likes/post/${postId}`);
      setLiked(res.data.liked);
      setCount(prev => (res.data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      className={`like-btn ${liked ? 'liked' : ''}`}
      onClick={toggleLike}
    >
      <span>{liked ? '❤️' : '🤍'}</span> {count}
    </button>
  );
}