// src/components/PostCard.jsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeButton from '@/components/LikeButton';
import MediaPlayer from '@/components/MediaPlayer';
import MediaViewer from '@/components/MediaViewer';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';
import { formatDateTime } from '@/utils/date';
import { postsService } from '@/services/posts';

export default function PostCard({ post, onDeleted }) {
  const navigate = useNavigate();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [local, setLocal] = useState(() => ({
    likeCount: post.likeCount ?? 0,
    commentCount: post.commentCount ?? 0,
    isLiked: !!post.isLikedByCurrentUser
  }));
  const [deleteLoading, setDeleteLoading] = useState(false);

  const attachments = useMemo(() => post.attachments || post.media || [], [post]);
  const isVisualMedia = (item) => {
    const rawType = (item?.type || item?.mediaType || '').toString().toLowerCase();
    return rawType.includes('image') || rawType.includes('video');
  };

  const author = useMemo(() => ({
    id: post.userId,
    name: post.userFullName ?? post.username,
    avatar: getAvatarUrl(post.userAvatar)
  }), [post]);

  const onLikeChange = (res) => {
    setLocal((s) => ({ ...s, isLiked: !!res.liked, likeCount: res.count ?? s.likeCount }));
  };

  const openDetails = () => navigate(`/posts/${post.id}`);
  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleDelete = async () => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    try {
      await postsService.remove(post.id);
      toast.success('Пост удалён');
      onDeleted?.(post);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) toast.error('Нет прав на удаление поста');
      else toast.error(err.response?.data || 'Не удалось удалить пост');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <article className="card bg-base-100 shadow-sm hover:shadow transition">
      <div className="card-body p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to={`/users/${author.id}`} className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
              <img src={author.avatar} alt={author.name} />
            </div>
          </Link>
          <div className="min-w-0">
            <Link to={`/users/${author.id}`} className="font-semibold hover:underline block truncate">
              @{author.name}
            </Link>
            <div className="text-xs opacity-60">{formatDateTime(post.createdAt)}</div>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <div className="mt-3 whitespace-pre-wrap break-words">{post.content}</div>
        )}

        {/* Media */}
        {attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 auto-rows-[120px] sm:auto-rows-[160px] gap-2">
            {attachments.map((m, idx) => (
              <button
                key={m.id || m.url}
                type="button"
                className={`text-left relative overflow-hidden rounded-xl bg-base-200 ${
                  idx === 0 && attachments.length > 2
                    ? 'col-span-2 row-span-2 sm:col-span-1 sm:row-span-1'
                    : ''
                } ${isVisualMedia(m) ? 'aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/9]' : ''}`}
                onClick={() => openViewer(idx)}
              >
                <MediaPlayer media={m} type={m.type} url={m.url} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LikeButton
              type="post"
              targetId={post.id}
              initialLiked={local.isLiked}
              initialCount={local.likeCount}
              onChange={onLikeChange}
            />
            <button className="btn btn-sm btn-ghost" onClick={openDetails} title="Открыть комментарии">
              <span className="flex items-center gap-2">
                <i className="fas fa-comment" aria-hidden="true"></i>
                <span>{local.commentCount}</span>
              </span>
            </button>
          </div>

          {/* Если это мой пост — можно удалить (если у тебя есть такая логика) */}
          {post.isOwn && (
            <button
              className={`btn btn-sm btn-outline btn-error ${deleteLoading ? 'loading' : ''}`}
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              Удалить
            </button>
          )}
        </div>
      </div>
      <MediaViewer
        open={viewerOpen}
        items={attachments}
        startIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </article>
  );
}
