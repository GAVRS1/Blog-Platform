// src/components/Comment.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function Comment({ comment, onDelete }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const queryClient = useQueryClient();
  
  // Получаем ID текущего пользователя из токена или контекста
  const currentUserId = localStorage.getItem('uid') || 
    JSON.parse(localStorage.getItem('user'))?.id?.toString();

  const isOwner = comment.userId?.toString() === currentUserId;

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      setLoadingReplies(true);
      try {
        const response = await api.get(`/comments/${comment.id}/replies`);
        setReplies(response.data);
      } catch (error) {
        toast.error('Не удалось загрузить ответы');
        console.error('Error loading replies:', error);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const response = await api.post(`/comments/${comment.id}/reply`, {
        content: replyText
      });
      
      setReplies(prev => [response.data, ...prev]);
      setReplyText('');
      toast.success('Ответ добавлен');
    } catch (error) {
      toast.error('Не удалось добавить ответ');
      console.error('Error submitting reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const deleteComment = async () => {
    if (!window.confirm('Удалить комментарий?')) return;
    
    try {
      await api.delete(`/comments/${comment.id}`);
      toast.success('Комментарий удалён');
      onDelete(comment.id);
      queryClient.invalidateQueries(['comments']);
    } catch (error) {
      toast.error('Не удалось удалить комментарий');
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <motion.div 
      className="bg-base-200/30 backdrop-blur-sm rounded-lg p-4 border border-base-300/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex gap-3">
        <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
          <img
            src={getAvatarUrl(comment.user?.profile?.profilePictureUrl)}
            alt={comment.user?.fullName || 'Аватар'}
            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 hover:border-primary/40 transition-colors"
          />
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/profile/${comment.userId}`}
              className="font-semibold text-base-content hover:text-primary transition-colors"
            >
              {comment.user?.fullName || 'Неизвестный пользователь'}
            </Link>
            <span className="text-xs text-base-content/60">
              @{comment.user?.username || 'unknown'}
            </span>
            <span className="text-xs text-base-content/40">·</span>
            <span className="text-xs text-base-content/60">
              {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <p className="text-base-content mb-3 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleReplies}
              className="btn btn-ghost btn-xs text-base-content/60 hover:text-primary"
            >
              <i className="fas fa-reply mr-1"></i>
              {comment.repliesCount > 0 ? `${comment.repliesCount} ответов` : 'Ответить'}
            </button>
            
            <button className="btn btn-ghost btn-xs text-base-content/60 hover:text-red-500">
              <i className="far fa-heart mr-1"></i>
              {comment.likesCount || 0}
            </button>
            
            {isOwner && (
              <button
                onClick={deleteComment}
                className="btn btn-ghost btn-xs text-base-content/60 hover:text-red-500"
              >
                <i className="fas fa-trash mr-1"></i>
                Удалить
              </button>
            )}
          </div>
          
          {/* Форма ответа */}
          {showReplies && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <form onSubmit={submitReply} className="mb-4">
                <div className="flex gap-2">
                  <textarea
                    className="textarea textarea-bordered textarea-sm w-full bg-base-100 border-base-300 focus:border-primary text-base-content"
                    placeholder="Написать ответ..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="2"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingReply || !replyText.trim()}
                  >
                    {submittingReply ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </form>
              
              {/* Ответы */}
              {loadingReplies ? (
                <div className="flex items-center justify-center py-4">
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                </div>
              ) : (
                <div className="space-y-3">
                  {replies.map(reply => (
                    <div key={reply.id} className="flex gap-3 bg-base-100/50 rounded-lg p-3">
                      <Link to={`/profile/${reply.userId}`}>
                        <img
                          src={getAvatarUrl(reply.user?.profile?.profilePictureUrl)}
                          alt={reply.user?.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-primary/20"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link 
                            to={`/profile/${reply.userId}`}
                            className="font-medium text-sm text-base-content hover:text-primary"
                          >
                            {reply.user?.fullName}
                          </Link>
                          <span className="text-xs text-base-content/60">
                            {new Date(reply.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm text-base-content">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}