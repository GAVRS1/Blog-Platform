// src/components/Comment.jsx
import { useState } from 'react';
import { getAvatarUrl } from '@/utils/avatar';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth'; // <-- Импортируем useAuth

export default function Comment({ comment, onDelete }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth(); // <-- Получаем данные текущего пользователя
  // const currentUserId = localStorage.getItem('uid'); // <-- Убираем это
  const isOwner = user && comment.userId === user.id; // <-- Сравниваем с user.id

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
        queryClient.invalidateQueries({ queryKey: ['post', comment.postId] }); // Используем объект queryKey
      })
      .catch(() => toast.error('Не удалось отправить ответ'));
  };

  return (
    <div className="flex gap-3 mb-4">
      <img
        src={avatarError ? '/avatar.png' : getAvatarUrl(comment.userAvatar)} // Используем getAvatarUrl
        alt={comment.username}
        className="w-8 h-8 rounded-full mt-1 object-cover aspect-square" // Добавим object-cover и aspect-square
        onError={() => setAvatarError(true)} // Обработка ошибки загрузки
      />
      <div className="flex-1">
        <div className="bg-base-200 rounded-lg p-2"> {/* Этот цвет должен адаптироваться под тему */}
          <p className="text-sm font-bold text-base-content">{comment.username}</p> {/* text-gray-800 -> text-base-content */}
          <p className="text-sm text-base-content">{comment.content}</p> {/* text-gray-700 -> text-base-content */}
        </div>

        <div className="flex items-center gap-3 text-xs text-base-content/60 mt-1"> {/* text-gray-500 -> text-base-content/60 */}
          <button onClick={toggleReplies}>
            {comment.replyCount || 0} ответа {/* <-- replyCount */}
          </button>
          {isOwner && (
            <button onClick={deleteComment} className="text-error">
              Удалить
            </button>
          )}
        </div>

        {showReplies && (
          <div className="mt-2 pl-4 border-l-2 border-base-300"> {/* border-gray-200 -> border-base-300 */}
            {replies.map((r) => (
              <div key={r.id} className="flex gap-2 mb-2">
                <img
                  src={avatarError ? '/avatar.png' : getAvatarUrl(r.userAvatar)} // Используем getAvatarUrl
                  alt={r.username}
                  className="w-6 h-6 rounded-full object-cover aspect-square" // Добавим object-cover и aspect-square
                  onError={() => setAvatarError(true)} // Обработка ошибки загрузки
                />
                <div className="bg-base-200 rounded px-2 py-1 text-sm"> {/* bg-gray-50 -> bg-base-200 */}
                  <b className="text-base-content">{r.username}</b> {/* text-gray-800 -> text-base-content */}
                  <span className="text-base-content"> {r.content}</span> {/* text-gray-700 -> text-base-content */}
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Ответить..."
                className="input input-xs input-bordered w-full" // Предполагается, что input-bordered адаптируется
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