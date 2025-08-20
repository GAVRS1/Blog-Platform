import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import MediaPlayer from './MediaPlayer';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.id === post.userId;

  // аватар автора
  const authorAvatar = post.userAvatar
    ? `${import.meta.env.VITE_API_BASE}/uploads/${post.userAvatar.replace(/\\/g, '/')}`
    : '/avatar.png';

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Удалить пост?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      window.location.reload();
    } catch {
      alert('Ошибка при удалении');
    }
  };

  return (
    <motion.div
      className="card bg-base-100 shadow-xl mb-6 cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="card-body">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt="avatar"
            className="w-12 h-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100"
          />
          <div>
            <h3 className="font-bold">{post.username}</h3>
            <span className="text-xs text-base-content/60">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <h2 className="card-title text-primary">{post.title}</h2>
        <p className="text-sm text-base-content/80">{post.content}</p>

        {/* MEDIA */}
        <MediaPlayer url={post.imageUrl} type="image" />
        <MediaPlayer url={post.videoUrl} type="video" />
        <MediaPlayer url={post.audioUrl} type="audio" />

        {/* ACTIONS */}
        <div className="card-actions justify-end">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser}
            initialCount={post.likesCount}
          />
          <button className="btn btn-ghost btn-sm gap-1">
            💬 {post.commentCount}
          </button>

          {isOwner && (
            <button
              className="btn btn-ghost btn-sm text-error"
              onClick={handleDelete}
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}