// src/components/PostCard.jsx - УЛУЧШЕННАЯ ВЕРСИЯ
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import LikeButton from '@/components/LikeButton';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const authorAvatarUrl = getAvatarUrl(post.userAvatar);
  const isOwner = user && post.userId === user.id;

  const handleDeletePost = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      toast.success('Пост удален');
      onDelete?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Ошибка при удалении поста');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}м назад`;
    if (diffHours < 24) return `${diffHours}ч назад`;
    if (diffDays < 7) return `${diffDays}д назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <motion.article
      className="bg-base-100 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-base-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="p-6">
        {/* Заголовок поста */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link to={`/user/${post.userId}`}>
                <img
                  src={avatarError ? '/default-avatar.png' : authorAvatarUrl}
                  alt={post.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-base-200"
                  onError={() => setAvatarError(true)}
                />
              </Link>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <Link 
                to={`/user/${post.userId}`}
                className="font-semibold text-base-content hover:text-primary transition-colors text-sm"
              >
                {post.fullName}
              </Link>
              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <span>@{post.username}</span>
                <span>•</span>
                <time>{formatDate(post.createdAt)}</time>
              </div>
            </div>
          </div>

          {/* Меню действий */}
          {isOwner && (
            <div className="relative">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-base-200 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-base-content/60">⋯</span>
              </motion.button>
              
              {showMenu && (
                <motion.div
                  className="absolute right-0 top-full mt-1 bg-base-100 rounded-2xl shadow-xl border border-base-200 py-1 z-10 min-w-32"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 text-left text-error hover:bg-error/10 transition-colors text-sm flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <div className="loading loading-spinner loading-xs" />
                    ) : (
                      <span>🗑️</span>
                    )}
                    Удалить
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Заголовок и содержание */}
        {post.title && (
          <Link to={`/post/${post.id}`}>
            <h2 className="font-bold text-lg text-base-content mb-3 hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>
        )}

        {post.content && (
          <div className="text-base-content/80 mb-4 leading-relaxed">
            <p className="line-clamp-4">{post.content}</p>
          </div>
        )}

        {/* Медиа контент */}
        {post.mediaUrl && (
          <motion.div 
            className="mb-4 rounded-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link to={`/post/${post.id}`}>
              <MediaPlayer
                url={post.mediaUrl}
                type={post.mediaType || 'image'}
                className="w-full max-h-96 object-cover"
              />
            </Link>
          </motion.div>
        )}

        {/* Действия */}
        <div className="flex items-center justify-between pt-4 border-t border-base-200/50">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLiked}
            initialCount={post.likesCount || 0}
          />

          <Link 
            to={`/post/${post.id}`}
            className="flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm">{post.commentsCount || 0}</span>
          </Link>

          <motion.button
            className="flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-lg">📤</span>
            <span className="text-sm">Поделиться</span>
          </motion.button>
        </div>
      </div>

      {/* Overlay для закрытия меню */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.article>
  );
}
