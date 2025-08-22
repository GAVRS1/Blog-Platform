// src/components/PostCard.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import LikeButton from '@/components/LikeButton';
import { useAuth } from '@/hooks/useAuth'; // Добавлено для проверки владельца поста
import api from '@/api/axios'; // Добавлено для запроса удаления
import toast from 'react-hot-toast'; // Добавлено для уведомлений

export default function PostCard({ post, onDelete }) { // Добавлен пропс onDelete
  const { user } = useAuth(); // Получаем текущего пользователя
  const authorAvatarUrl = getAvatarUrl(post.userAvatar);

  // Проверяем, является ли текущий пользователь автором поста
  const isOwner = user && post.userId === user.id;

  // Функция для удаления поста
  const handleDeletePost = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) return;

    try {
      await api.delete(`/posts/${post.id}`);
      toast.success('Пост удален');
      // Вызываем функцию onDelete, переданную из родителя, чтобы обновить список
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
      className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 mb-6 overflow-hidden hover:shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-body p-6">
        <motion.div
          className="flex items-center gap-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <motion.img
              src={authorAvatarUrl}
              alt={post.userFullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 aspect-square"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            />
            <div>
              <h3 className="font-semibold text-base-content hover:text-primary transition-colors">
                {post.userFullName}
              </h3>
              <p className="text-sm text-base-content/60">
                @{post.username} • {new Date(post.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </Link>
          {/* --- Добавлено: Кнопка удаления для владельца поста --- */}
          {isOwner && (
            <button
              onClick={handleDeletePost}
              className="ml-auto btn btn-ghost btn-sm text-error hover:text-error/80"
              aria-label="Удалить пост"
            >
              🗑️ {/* Или используйте иконку, например, <i className="fas fa-trash"></i> */}
            </button>
          )}
          {/* --- Конец добавления --- */}
        </motion.div>

        <Link to={`/post/${post.id}`}>
          <motion.h2
            className="text-xl font-bold text-base-content mb-3 hover:text-primary transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {post.title}
          </motion.h2>
        </Link>
        <motion.p
          className="text-base-content/80 mb-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {post.content}
        </motion.p>

        {(post.imageUrl || post.videoUrl || post.audioUrl) && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MediaPlayer
              url={post.imageUrl || post.videoUrl || post.audioUrl}
              type={post.imageUrl ? 'image' :
                post.videoUrl ? 'video' :
                  post.audioUrl ? 'audio' : 'image'}
              className="max-h-96 object-cover"
            />
          </motion.div>
        )}

        <motion.div
          className="flex items-center justify-between pt-4 border-t border-base-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLikedByCurrentUser || false}
              initialCount={post.likeCount || 0}
            />
            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors"
            >
              <span className="text-lg">💬</span> {/* Заменено на смайлик */}
              <span className="text-sm font-medium">{post.commentCount || 0}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-outline">
              {post.contentType}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}