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
      
      // Обновляем счетчик комментариев в посте
      setPost(prev => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
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
      commentsCount: Math.max((prev.commentsCount || 1) - 1, 0)
    }));
  };

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
        <h2 className="text-2xl font-bold text-gray-700">Пост не найден</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      /* Основной пост */
      <motion.div
        className="bg-white rounded-lg shadow-xl p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        /* Автор поста */
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to={`/profile/${post.userId}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={getAvatarUrl(post.userAvatar)}
              alt={post.userFullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
            />
            <div>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                {post.userFullName}
              </h3>
              <p className="text-gray-500">
                @{post.username} • {new Date(post.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </Link>
        </div>

        /* Контент поста */
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">{post.content}</p>

        /* Медиа */
        {(post.imageUrl || post.videoUrl || post.audioUrl) && (
          <div className="mb-6">
            <MediaPlayer 
              url={post.imageUrl || post.videoUrl || post.audioUrl}
              type={post.contentType === 'Photo' ? 'image' : 
                    post.contentType === 'Video' ? 'video' : 
                    post.contentType === 'Audio' ? 'audio' : 'image'}
              className="max-h-96"
            />
          </div>
        )}

        /* Действия */
        <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
          <LikeButton 
            postId={post.id} 
            initialLiked={post.isLiked || false}
            initialCount={post.likesCount || 0}
          />
          
          <div className="flex items-center gap-2 text-gray-600">
            <i className="far fa-comment text-xl"></i>
            <span className="font-medium">{post.commentsCount || 0}</span>
          </div>
          
          <span className="badge badge-primary badge-outline ml-auto">
            {post.contentType}
          </span>
        </div>
      </motion.div>

      /* Секция комментариев */
      <div className="bg-white rounded-lg shadow-xl p-8" id="comments">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Комментарии ({comments.length})
        </h3>

        /* Форма добавления комментария */
        {user && (
          <div className="flex gap-4 mb-8">
            <img
              src={getAvatarUrl(user.profile?.profilePictureUrl)}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

        /* Список комментариев */
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
              <i className="far fa-comments text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">
                {user ? 'Будьте первым, кто оставит комментарий!' : 'Войдите, чтобы оставить комментарий'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}