// src/components/Comment.jsx
import { useEffect, useState } from 'react';
import LikeButton from '@/components/LikeButton';
import { commentsService } from '@/services/comments';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';

/**
 * Компонент комментария с возможностью:
 * - поставить лайк комменту (если включено)
 * - ответить на комментарий
 * - подгрузить/показать ответы
 */
export default function Comment({
  comment,
  enableLike = false,
  onDeleted,
  currentUserId,
  postUserId
}) {
  const [local, setLocal] = useState(() => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    userId: comment.userId,
    username: comment.username,
    userAvatar: getAvatarUrl(comment.userAvatar),
    likeCount: comment.likeCount ?? 0,
    replyCount: comment.replyCount ?? 0,
    isLiked: !!comment.isLikedByCurrentUser
  }));

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(null);
  const [replyPage, setReplyPage] = useState(1);
  const [replyHasMore, setReplyHasMore] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setLocal((s) => ({
      ...s,
      likeCount: comment.likeCount ?? s.likeCount,
      replyCount: comment.replyCount ?? s.replyCount,
      isLiked: !!comment.isLikedByCurrentUser
    }));
  }, [comment.likeCount, comment.replyCount, comment.isLikedByCurrentUser]);

  async function loadReplies(p = 1, replace = false) {
    try {
      const res = await commentsService.listReplies(local.id, p, 10);
      if (!res || !res.items) {
        // если на бэке выдачи нет — считаем нет реализации
        setReplies([]);
        setReplyHasMore(false);
        return;
      }
      setReplies((prev) => replace ? res.items : ([...(prev || []), ...res.items]));
      setReplyPage(p);
      setReplyHasMore(res.items.length === 10);
    } catch {
      toast.error('Не удалось загрузить ответы');
    }
  }

  const toggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setShowReplies(true);
    if (!replies) {
      await loadReplies(1, true);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const saved = await commentsService.reply(local.id, replyText.trim());
      // оптимистично приклеим снизу
      setReplies((prev) => [...(prev || []), saved]);
      setReplyText('');
      setLocal((s) => ({ ...s, replyCount: (s.replyCount || 0) + 1 }));
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) toast.error('Слишком часто. Попробуйте позже.');
      else if (status === 403) toast.error('Ответ запрещён настройками приватности/блокировками');
      else toast.error(err.response?.data || 'Не удалось отправить ответ');
    } finally {
      setReplyLoading(false);
    }
  };

  const canDelete = Boolean(
    currentUserId && (currentUserId === local.userId || currentUserId === postUserId)
  );

  const handleDelete = async () => {
    if (!canDelete || deleteLoading) return;
    setDeleteLoading(true);
    try {
      await commentsService.remove(local.id);
      onDeleted?.(local.id);
      toast.success('Комментарий удалён');
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) toast.error('Нет прав на удаление комментария');
      else toast.error(err.response?.data || 'Не удалось удалить комментарий');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-9 h-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
              <img src={local.userAvatar} alt={local.username} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">@{local.username}</div>
            <div className="text-xs opacity-60">{new Date(local.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-2 whitespace-pre-wrap break-words">{local.content}</div>

        <div className="mt-2 flex items-center gap-2">
          {enableLike && (
            <LikeButton
              type="comment"
              targetId={local.id}
              initialLiked={local.isLiked}
              initialCount={local.likeCount}
              onChange={(r) => setLocal((s) => ({ ...s, isLiked: !!r.liked, likeCount: r.count ?? s.likeCount }))}
            />
          )}
          <button className="btn btn-sm btn-ghost" onClick={toggleReplies}>
            Ответы <span className="ml-2">{local.replyCount}</span>
          </button>
          {canDelete && (
            <button
              className={`btn btn-sm btn-outline btn-error ${deleteLoading ? 'loading' : ''}`}
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              Удалить
            </button>
          )}
        </div>

        {/* REPLIES */}
        {showReplies && (
          <div className="mt-3 pl-4 border-l border-base-300 space-y-3">
            {/* список ответов */}
            {replies === null && (
              <div className="flex justify-center py-3">
                <span className="loading loading-spinner text-primary" />
              </div>
            )}
            {replies?.length === 0 && (
              <div className="text-sm opacity-60">Пока нет ответов</div>
            )}
            {replies?.map(r => (
              <ReplyItem key={r.id} reply={r} />
            ))}
            {replyHasMore && (
              <button className="btn btn-xs btn-outline" onClick={() => loadReplies(replyPage + 1)}>
                Показать ещё
              </button>
            )}

            {/* отправка ответа */}
            <form onSubmit={sendReply} className="flex items-end gap-2">
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                placeholder="Напишите ответ..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button className={`btn btn-primary ${replyLoading ? 'loading' : ''}`} disabled={replyLoading}>
                Отправить
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyItem({ reply }) {
  return (
    <div className="flex items-start gap-3">
      <div className="avatar">
        <div className="w-8 h-8 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2 overflow-hidden">
          <img src={getAvatarUrl(reply.userAvatar)} alt={reply.username} />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium">@{reply.username}</div>
        <div className="text-xs opacity-60">{new Date(reply.createdAt).toLocaleString()}</div>
        <div className="mt-1 whitespace-pre-wrap break-words text-sm">{reply.content}</div>
      </div>
    </div>
  );
}
