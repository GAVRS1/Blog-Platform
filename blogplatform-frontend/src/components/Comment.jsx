import { useState } from 'react';
import api from '../api/axios';

export default function Comment({ comment, depth = 0 }) {
    const [replyText, setReplyText] = useState('');
    const [showReply, setShowReply] = useState(false);

    const handleReply = async () => {
    if (!replyText.trim()) return;
    await api.post('/comments', { postId: comment.postId, content: replyText });
    setReplyText('');
    setShowReply(false);
    window.location.reload(); // просто для демо
    };

    return (
    <div style={{ marginLeft: depth * 20, marginBottom: 10 }}>
        <div className="comment-header">
        <strong>{comment.user?.username}</strong> · {new Date(comment.createdAt).toLocaleString()}
        </div>
        <p>{comment.content}</p>
        <button onClick={() => setShowReply(!showReply)}>Ответить</button>
        {showReply && (
        <div className="reply-form">
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} />
            <button onClick={handleReply}>Отправить</button>
        </div>
        )}
    </div>
    );
}