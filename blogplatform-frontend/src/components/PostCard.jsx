// src/components/PostCard.jsx (обновленная версия без счетчика просмотров)
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import LikeButton from '@/components/LikeButton';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const authorAvatarUrl = getAvatarUrl(post.userAvatar);
  const isOwner = user && post.userId === user.id;

  const handleDeletePost = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) return;

    try {
      await api.delete(`/posts/${post.id}`);
      toast.success('Пост удален');
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (err) {
      console.error('Ошибка при удалении поста:', err);
      toast.error('Не удалось удалить пост');
    }
  };

  return (
    <motion.div
      className="card bg-base-100/90 backdrop-blur-sm shadow-xl border border-base-300/30 mb-4 sm:mb-6 overflow-hidden hover:shadow-2xl rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-body p-4 sm:p-6">
        <motion.div
          className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
            <motion.img
              src={authorAvatarUrl}
              alt={post.userFullName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20 aspect-square"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-base-content hover:text-primary transition-colors truncate">
                {post.userFullName}
              </h3>
              <p className="text-xs sm:text-sm text-base-content/60 truncate">
                @{post.username} • {new Date(post.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </Link>
          
          {isOwner && (
            <button
              onClick={handleDeletePost}
              className="btn btn-ghost btn-sm text-error hover:text-error/80 hover:bg-error/10"
              aria-label="Удалить пост"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          )}
        </motion.div>

        <Link to={`/post/${post.id}`}>
          <motion.h2
            className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3 hover:text-primary transition-colors cursor-pointer line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {post.title}
          </motion.h2>
        </Link>
        
        <motion.p
          className="text-sm sm:text-base text-base-content/80 mb-3 sm:mb-4 leading-relaxed line-clamp-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {post.content}
        </motion.p>

        {(post.imageUrl || post.videoUrl || post.audioUrl) && (
          <motion.div
            className="mb-3 sm:mb-4 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MediaPlayer
              url={post.imageUrl || post.videoUrl || post.audioUrl}
              type={post.imageUrl ? 'image' :
                post.videoUrl ? 'video' :
                  post.audioUrl ? 'audio' : 'image'}
              className="max-h-64 sm:max-h-96 object-cover"
            />
          </motion.div>
        )}

        <motion.div
          className="flex items-center justify-between pt-3 sm:pt-4 border-t border-base-300/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLikedByCurrentUser || false}
              initialCount={post.likeCount || 0}
            />
            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center gap-1 sm:gap-2 text-base-content/60 hover:text-primary transition-colors"
            >
              <span className="text-base sm:text-lg">💬</span>
              <span className="text-xs sm:text-sm font-medium">{post.commentCount || 0}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-outline text-xs">
              {post.contentType}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}