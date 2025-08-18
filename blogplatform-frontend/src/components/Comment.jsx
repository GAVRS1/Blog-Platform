import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function Comment({ comment, depth = 0, onReply }) {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const avatarUrl = comment.userAvatar
    ? `${import.meta.env.VITE_API_BASE}/uploads/${comment.userAvatar.replace(/\\/g, '/')}`
    : '/avatar.png';

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const { data } = await api.post(`/comments/${comment.id}/reply`, {
        content: replyText,
      });
      setReplies((prev) => [data, ...prev]);
      onReply?.(data);
      setReplyText('');
      setShowReply(false);
    } catch {
      toast.error('Ошибка при отправке ответа');
    }
  };

  return (
    <motion.div
      style={{ marginLeft: depth * 24 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4"
    >
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-8 h-8 rounded-full ring ring-primary ring-offset-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <strong className="text-sm">{comment.username}</strong>
            <span className="text-xs text-base-content/60">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-base-content/90">{comment.content}</p>

          <button
            className="text-xs link link-primary mr-2"
            onClick={() => setShowReply(!showReply)}
          >
            Ответить
          </button>

          {/* Кнопка удалить (свой коммент) */}
          {comment.userId === Number(localStorage.getItem('uid')) && (
            <button
              className="text-xs link link-error"
              onClick={async () => {
                await api.delete(`/comments/${comment.id}`);
                onReply?.();
              }}
            >
              Удалить
            </button>
          )}
        </div>
      </div>

      {showReply && (
        <div className="mt-2 ml-11">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="textarea textarea-bordered textarea-sm w-full"
            placeholder="Напишите ответ..."
          />
          <button
            className="btn btn-xs btn-primary mt-1"
            onClick={handleReply}
          >
            Отправить
          </button>
        </div>
      )}

      {replies.map((r) => (
        <Comment key={r.id} comment={r} depth={depth + 1} onReply={onReply} />
      ))}
    </motion.div>
  );
}