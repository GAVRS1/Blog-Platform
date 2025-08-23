// src/pages/PostDetailPage.jsx (критические исправления мобильной верстки)
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import Comment from '@/components/Comment';
import LikeButton from '@/components/LikeButton';
import SkeletonPost from '@/components/SkeletonPost';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-2 sm:p-4 cursor-zoom-out"
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
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-xl sm:text-2xl bg-black/50 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/70 z-10"
            onClick={onClose}
          >
            &times;
          </button>
          <img
            src={imageUrl}
            alt="Увеличенное изображение"
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

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

  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl('');
    document.body.style.overflow = 'unset';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <SkeletonPost />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-base-content">Пост не найден</h2>
      </div>
    );
  }

  const authorAvatarUrl = getAvatarUrl(post.userAvatar);
  const currentUserAvatarUrl = user?.profile?.profilePictureUrl ? getAvatarUrl(user.profile.profilePictureUrl) : '/avatar.png';
  const mediaUrl = post.imageUrl || post.videoUrl || post.audioUrl;
  const mediaType = post.imageUrl ? 'image' : post.videoUrl ? 'video' : post.audioUrl ? 'audio' : null;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
      <ImageModal isOpen={isImageModalOpen} imageUrl={selectedImageUrl} onClose={closeImageModal} />

      <motion.div
        className="bg-base-100/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-base-300/30 p-4 sm:p-8 mb-4 sm:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link
            to={`/profile/${post.userId}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <img
              src={authorAvatarUrl}
              alt={post.userFullName}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-primary/20 aspect-square flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg hover:text-primary transition-colors text-base-content truncate">
                {post.userFullName}
              </h3>
              <p className="text-sm sm:text-base text-base-content/70 truncate">
                @{post.username} • {new Date(post.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </Link>
        </div>
        
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content mb-3 sm:mb-4">{post.title}</h1>
        <p className="text-base sm:text-lg text-base-content leading-relaxed mb-4 sm:mb-6">{post.content}</p>

        {mediaUrl && (
          <div className="mb-4 sm:mb-6 cursor-pointer" onClick={mediaType === 'image' ? () => openImageModal(mediaUrl) : undefined}>
            <MediaPlayer
              url={mediaUrl}
              type={mediaType}
              className="max-h-64 sm:max-h-96 w-full rounded-xl"
            />
          </div>
        )}

        <div className="flex items-center gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-base-300/50">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser || false}
            initialCount={post.likeCount || 0}
          />
          <Link
            to={`/post/${post.id}#comments`}
            className="flex items-center gap-1 sm:gap-2 text-base-content/70 hover:text-primary transition-colors"
          >
            <span className="text-lg sm:text-xl">💬</span>
            <span className="text-sm sm:text-base font-medium">{post.commentCount || 0}</span>
          </Link>
          <span className="badge badge-primary badge-outline text-xs sm:text-sm ml-auto">
            {post.contentType}
          </span>
        </div>
      </motion.div>
      
      <div className="bg-base-100/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-base-300/30 p-4 sm:p-8" id="comments">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content mb-4 sm:mb-6">
          Комментарии ({comments.length})
        </h3>
        
        {user && (
          <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
            <img
              src={currentUserAvatarUrl}
              alt={user.fullName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover aspect-square flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="w-full p-2 sm:p-3 border border-base-300 rounded-lg sm:rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                rows={2}
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim() || submittingComment}
                className="btn btn-primary btn-sm sm:btn-md mt-2"
              >
                {submittingComment ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-1"></span>
                    Отправка...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-1 sm:mr-2 text-xs sm:text-sm"></i>
                    Отправить
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-4 sm:space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={handleDeleteComment}
            />
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <i className="far fa-comments text-3xl sm:text-4xl text-base-content/30 mb-3"></i>
              <p className="text-sm sm:text-base text-base-content/70">
                {user ? 'Будьте первым, кто оставит комментарий!' : 'Войдите, чтобы оставить комментарий'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}