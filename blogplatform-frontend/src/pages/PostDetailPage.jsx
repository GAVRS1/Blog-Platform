// src/pages/PostDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Импортируем AnimatePresence
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import Comment from '@/components/Comment';
import LikeButton from '@/components/LikeButton';
import SkeletonPost from '@/components/SkeletonPost';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import toast from 'react-hot-toast';

// --- Компонент модального окна ---
const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence> {/* Обернул в AnimatePresence для анимаций framer-motion */}
      <motion.div
        className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative max-w-full max-h-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 z-10"
            onClick={onClose}
          >
            &times;
          </button>
          {/* Используем обычный img для модального окна, чтобы избежать проблем с LazyLoadImage внутри модалки */}
          <img
            src={imageUrl}
            alt="Увеличенное изображение"
            className="max-h-[90vh] max-w-full object-contain"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
// --- Конец компонента модального окна ---

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  // --- Состояние для модального окна ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  // --- Конец состояния ---

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/comments/post/${id}`),
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);
      } catch (error) {
        toast.error('Не удалось загрузить пост');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const response = await api.post('/comments', {
        postId: id,
        content: newComment,
      });
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      setPost(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }));
      toast.success('Комментарий добавлен!');
    } catch (error) {
      toast.error('Ошибка при добавлении комментария');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setPost(prev => ({
      ...prev,
      commentCount: Math.max((prev.commentCount || 1) - 1, 0)
    }));
  };

  // --- Функции для модального окна ---
  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
    // Предотвращаем скролл body при открытии модального окна
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl('');
    // Восстанавливаем скролл
    document.body.style.overflow = 'unset';
  };
  // --- Конец функций ---

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonPost />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-base-content">Пост не найден</h2>
      </div>
    );
  }

  const authorAvatarUrl = getAvatarUrl(post.userAvatar);
  const currentUserAvatarUrl = user?.profile?.profilePictureUrl ? getAvatarUrl(user.profile.profilePictureUrl) : '/avatar.png';

  // Определяем URL медиа для поста
  const mediaUrl = post.imageUrl || post.videoUrl || post.audioUrl;
  const mediaType = post.imageUrl ? 'image' : post.videoUrl ? 'video' : post.audioUrl ? 'audio' : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* --- Модальное окно --- */}
      <ImageModal isOpen={isImageModalOpen} imageUrl={selectedImageUrl} onClose={closeImageModal} />
      {/* --- Конец модального окна --- */}

      <motion.div
        className="bg-base-100 rounded-lg shadow-xl p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link
            to={`/profile/${post.userId}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={authorAvatarUrl}
              alt={post.userFullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 aspect-square"
            />
            <div>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors text-base-content">
                {post.userFullName}
              </h3>
              <p className="text-base-content/70">
                @{post.username} • {new Date(post.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-base-content mb-4">{post.title}</h1>
        <p className="text-base-content text-lg leading-relaxed mb-6">{post.content}</p>

        {/* --- Обновленный блок отображения медиа --- */}
        {mediaUrl && (
          <div className="mb-6">
            <MediaPlayer
              url={mediaUrl}
              type={mediaType}
              className="max-h-96 w-full" // Ограничиваем высоту контейнера MediaPlayer
              // Передаем функцию открытия модального окна только для изображений
              onClick={mediaType === 'image' ? () => openImageModal(mediaUrl) : undefined}
            />
          </div>
        )}
        {/* --- Конец обновленного блока --- */}

        <div className="flex items-center gap-6 pt-6 border-t border-base-300">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser || false}
            initialCount={post.likeCount || 0}
          />
          {/* --- Заменена иконка комментариев --- */}
          <Link
            to={`/post/${post.id}#comments`}
            className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
          >
            <span className="text-xl">💬</span> {/* Заменено на смайлик */}
            <span className="font-medium">{post.commentCount || 0}</span>
          </Link>
          {/* --- Конец замены --- */}
          <span className="badge badge-primary badge-outline ml-auto">
            {post.contentType}
          </span>
        </div>
      </motion.div>
      <div className="bg-base-100 rounded-lg shadow-xl p-8" id="comments">
        <h3 className="text-2xl font-bold text-base-content mb-6">
          Комментарии ({comments.length})
        </h3>
        {user && (
          <div className="flex gap-4 mb-8">
            <img
              src={currentUserAvatarUrl}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover aspect-square"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="w-full p-3 border border-base-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim() || submittingComment}
                className="btn btn-primary mt-2"
              >
                {submittingComment ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Отправка...</>
                ) : (
                  <><i className="fas fa-paper-plane mr-2"></i> Отправить</>
                )}
              </button>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={handleDeleteComment}
            />
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8">
              <i className="far fa-comments text-4xl text-base-content/30 mb-3"></i>
              <p className="text-base-content/70">
                {user ? 'Будьте первым, кто оставит комментарий!' : 'Войдите, чтобы оставить комментарий'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}