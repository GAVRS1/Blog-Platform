// src/components/Comment.jsx (исправленная версия)
import { useState } from 'react';
import { getAvatarUrl } from '@/utils/avatar';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export default function Comment({ comment, onDelete }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isOwner = user && comment.userId === user.id;

  const toggleReplies = () => {
    if (!showReplies) {
      api.get(`/comments/${comment.id}/replies`)
        .then(({ data }) => setReplies(data))
        .catch(() => toast.error('Не удалось загрузить ответы'));
    }
    setShowReplies(!showReplies);
  };

  const deleteComment = () => {
    api.delete(`/comments/${comment.id}`)
      .then(() => {
        toast.success('Комментарий удалён');
        onDelete(comment.id);
      })
      .catch(() => toast.error('Ошибка при удалении'));
  };

  const sendReply = () => {
    if (!replyText.trim()) return;
    api.post(`/comments/${comment.id}/reply`, { content: replyText })
      .then(({ data }) => {
        setReplies([data, ...replies]);
        setReplyText('');
        queryClient.invalidateQueries({ queryKey: ['post', comment.postId] });
      })
      .catch(() => toast.error('Не удалось отправить ответ'));
  };

  const commenterAvatarUrl = avatarError ? '/avatar.png' : getAvatarUrl(comment.userAvatar);
  const getReplyAvatarUrl = (replyAvatarPath) => {
    try {
      return getAvatarUrl(replyAvatarPath);
    } catch (e) {
      return '/avatar.png';
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
      <img
        src={commenterAvatarUrl}
        alt={comment.username}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mt-1 object-cover aspect-square flex-shrink-0"
        onError={() => setAvatarError(true)}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-base-200/70 rounded-xl sm:rounded-2xl p-2 sm:p-3">
          <p className="text-xs sm:text-sm font-bold text-base-content mb-1">{comment.username}</p>
          <p className="text-xs sm:text-sm text-base-content leading-relaxed break-words">{comment.content}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs text-base-content/60 mt-1 sm:mt-2">
          <button 
            onClick={toggleReplies}
            className="hover:text-primary transition-colors"
          >
            {comment.replyCount || 0} ответа
          </button>
          {isOwner && (
            <button 
              onClick={deleteComment} 
              className="text-error hover:text-error/80 transition-colors"
            >
              Удалить
            </button>
          )}
        </div>

        {showReplies && (
          <div className="mt-2 sm:mt-3 pl-3 sm:pl-4 border-l-2 border-base-300">
            {replies.map((r) => (
              <div key={r.id} className="flex gap-2 mb-2">
                <img
                  src={getReplyAvatarUrl(r.userAvatar)}
                  alt={r.username}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover aspect-square flex-shrink-0"
                  onError={(e) => { e.target.src = '/avatar.png'; }}
                />
                <div className="bg-base-200/50 rounded-lg px-2 py-1 text-xs sm:text-sm flex-1 min-w-0">
                  <b className="text-base-content">{r.username}</b>
                  <span className="text-base-content ml-1 break-words">{r.content}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Ответить..."
                className="input input-xs sm:input-sm input-bordered w-full text-xs sm:text-sm"
              />
              <button 
                onClick={sendReply} 
                className="btn btn-xs sm:btn-sm btn-primary"
              >
                Отправить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}