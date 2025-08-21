// src/pages/PostDetailPage.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import Comment from '@/components/Comment';
import LikeButton from '@/components/LikeButton';
import SkeletonPost from '@/components/SkeletonPost';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/comments/post/${id}`)
        ]);
        
        setPost(postResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        toast.error('Не удалось загрузить пост');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post('/comments', {
        content: newComment,
        postId: parseInt(id)
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      toast.success('Комментарий добавлен');
    } catch (error) {
      toast.error('Не удалось добавить комментарий');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SkeletonPost />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-base-content mb-2">Пост не найден</h2>
        <p className="text-base-content/60">Возможно, пост был удален или не существует</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.article
          className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-body p-8">
            {/* Заголовок поста */}
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link 
                to={`/profile/${post.userId}`}
                className="flex items-center gap-3 hover:bg-base-200/50 rounded-lg p-2 transition-colors"
              >
                <img
                  src={getAvatarUrl(post.user?.profile?.profilePictureUrl)}
                  alt={post.user?.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h3 className="font-semibold text-base-content hover:text-primary transition-colors">
                    {post.user?.fullName}
                  </h3>
                  <p className="text-sm text-base-content/60">@{post.user?.username}</p>
                </div>
              </Link>
              
              <div className="ml-auto text-sm text-base-content/60">
                <i className="far fa-clock mr-1"></i>
                {new Date(post.createdAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </motion.div>

            {/* Заголовок поста */}
            <motion.h1
              className="text-3xl font-bold text-base-content mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {post.title}
            </motion.h1>

            {/* Контент поста */}
            <motion.div
              className="prose max-w-none text-base-content mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </motion.div>

            {/* Медиа контент */}
            {post.mediaPath && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <MediaPlayer 
                  url={post.mediaPath} 
                  type={post.contentType === 0 ? 'image' : post.contentType === 1 ? 'video' : 'audio'} 
                  className="w-full rounded-lg"
                />
              </motion.div>
            )}

            {/* Действия с постом */}
            <motion.div
              className="flex items-center gap-4 pt-4 border-t border-base-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <LikeButton
                postId={post.id}
                initialLiked={post.isLiked}
                initialCount={post.likesCount}
              />
              
              <div className="flex items-center gap-2 text-base-content/60">
                <i className="far fa-comment text-lg"></i>
                <span className="font-medium">{comments.length}</span>
              </div>
              
              <div className="flex items-center gap-2 text-base-content/60">
                <i className="far fa-eye text-lg"></i>
                <span className="font-medium">{post.viewsCount || 0}</span>
              </div>
            </motion.div>
          </div>
        </motion.article>

        {/* Форма добавления комментария */}
        {user && (
          <motion.div
            className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-base-content mb-4">Добавить комментарий</h3>
              <form onSubmit={handleAddComment} className="space-y-4">
                <div className="flex gap-3">
                  <img
                    src={getAvatarUrl(user?.profile?.profilePictureUrl)}
                    alt={user?.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1">
                    <textarea
                      className="textarea textarea-bordered w-full bg-base-100 border-base-300 focus:border-primary text-base-content"
                      placeholder="Поделитесь своими мыслями..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows="3"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Отправляем...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Отправить
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Комментарии */}
        <motion.div
          className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold text-base-content mb-6 flex items-center gap-2">
              <i className="fas fa-comments text-primary"></i>
              Комментарии ({comments.length})
            </h3>
            
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-comments text-4xl text-base-content/30 mb-3"></i>
                <p className="text-base-content/60">Пока нет комментариев</p>
                <p className="text-sm text-base-content/40">Будьте первым, кто прокомментирует!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Comment 
                      comment={comment} 
                      onDelete={handleDeleteComment}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}