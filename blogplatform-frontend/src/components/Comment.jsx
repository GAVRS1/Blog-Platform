// src/components/Comment.jsx
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
    <div className="flex gap-3 mb-4">
      <img
        src={commenterAvatarUrl}
        alt={comment.username}
        className="w-8 h-8 rounded-full mt-1 object-cover aspect-square"
        onError={() => setAvatarError(true)}
      />
      <div className="flex-1">
        <div className="bg-base-200 rounded-lg p-2">
          <p className="text-sm font-bold text-base-content">{comment.username}</p>
          <p className="text-sm text-base-content">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-base-content/60 mt-1">
          <button onClick={toggleReplies}>
            {comment.replyCount || 0} ответа
          </button>
          {isOwner && (
            <button onClick={deleteComment} className="text-error">
              Удалить
            </button>
          )}
        </div>
        {showReplies && (
          <div className="mt-2 pl-4 border-l-2 border-base-300">
            {replies.map((r) => (
              <div key={r.id} className="flex gap-2 mb-2">
                <img
                  src={getReplyAvatarUrl(r.userAvatar)}
                  alt={r.username}
                  className="w-6 h-6 rounded-full object-cover aspect-square"
                  onError={(e) => { e.target.src = '/avatar.png'; }}
                />
                <div className="bg-base-200 rounded px-2 py-1 text-sm">
                  <b className="text-base-content">{r.username}</b>
                  <span className="text-base-content"> {r.content}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Ответить..."
                className="input input-xs input-bordered w-full bg-base-100 text-base-content"
              />
              <button onClick={sendReply} className="btn btn-xs btn-primary">
                Отправить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}