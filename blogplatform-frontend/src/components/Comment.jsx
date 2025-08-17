import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function Comment({ comment, depth = 0, onReply }) {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const { data } = await api.post(`/comments/${comment.id}/reply`, {
        content: replyText,
      });
      setReplies((prev) => [...prev, data]);
      onReply?.(data);
      setReplyText('');
      setShowReply(false);
    } catch {
      toast.error('Ошибка при отправке ответа');
    }
  };

  return (
    <motion.div
      style={{ marginLeft: depth * 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="comment-header">
        <strong>{comment.user?.username}</strong> ·{' '}
        {new Date(comment.createdAt).toLocaleString()}
      </div>
      <p>{comment.content}</p>
      <button onClick={() => setShowReply(!showReply)}>Ответить</button>

      {showReply && (
        <div className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            placeholder="Напишите ответ..."
          />
          <button onClick={handleReply}>Отправить</button>
        </div>
      )}

      {replies.map((r) => (
        <Comment key={r.id} comment={r} depth={depth + 1} />
      ))}
    </motion.div>
  );
}