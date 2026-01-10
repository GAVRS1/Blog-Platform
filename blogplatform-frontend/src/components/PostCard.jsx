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

  // Количество медиа-элементов
  const mediaCount = attachments.length;

  // Вычисляем шаблон сетки на основе количества медиа
  const gridTemplate = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Mobile шаблоны (до 768px)
    if (isMobile) {
      switch (mediaCount) {
        case 1:
          return {
            grid: 'grid-cols-1',
            aspect: 'aspect-[4/5]',
            className: 'w-full'
          };
        case 2:
          return {
            grid: 'grid-cols-2',
            aspect: 'aspect-square',
            className: 'w-full'
          };
        case 3:
          return {
            grid: 'grid-cols-2',
            aspect: 'aspect-[4/5]',
            className: 'col-span-1 row-span-1 first:col-span-2'
          };
        case 4:
        case 5:
        case 6:
          return {
            grid: 'grid-cols-2',
            aspect: 'aspect-[4/5]',
            className: 'w-full'
          };
        default: // 7+ медиа
          return {
            grid: 'grid-cols-2',
            aspect: 'aspect-[4/5]',
            className: 'w-full',
            maxItems: 6 // Показываем максимум 6, остальные скрываем под +N
          };
      }
    }

    // Desktop шаблоны (>= 768px)
    switch (mediaCount) {
      case 1:
        return {
          grid: 'grid-cols-1',
          aspect: 'aspect-[16/9]',
          className: 'w-full'
        };
      case 2:
        return {
          grid: 'grid-cols-2',
          aspect: 'aspect-[4/3]',
          className: 'w-full'
        };
      case 3:
        return {
          grid: 'grid-cols-6',
          aspect: 'aspect-square',
          className: 'col-span-4 row-span-2 first:col-span-4 first:row-span-2'
        };
      case 4:
        return {
          grid: 'grid-cols-2 grid-rows-2',
          aspect: 'aspect-square',
          className: 'w-full'
        };
      case 5:
        return {
          grid: 'grid-cols-4 grid-rows-2',
          aspect: 'aspect-square',
          className: 'col-span-2 row-span-2 first:col-span-2 first:row-span-2'
        };
      case 6:
        return {
          grid: 'grid-cols-3 grid-rows-2',
          aspect: 'aspect-square',
          className: 'w-full'
        };
      case 7:
      case 8:
      case 9:
        return {
          grid: 'grid-cols-3',
          aspect: 'aspect-[4/3]',
          className: 'w-full'
        };
      default: // 10 медиа
        return {
          grid: 'grid-cols-3 grid-rows-3',
          aspect: 'aspect-[4/3]',
          className: 'w-full',
          maxItems: 9 // Показываем 9, на последней +1
        };
    }
  }, [mediaCount]);

  // Ограничиваем количество отображаемых элементов
  const visibleAttachments = useMemo(() => {
    const maxItems = gridTemplate.maxItems;
    if (maxItems && attachments.length > maxItems) {
      return attachments.slice(0, maxItems);
    }
    return attachments;
  }, [attachments, gridTemplate]);

  // Проверяем, нужно ли показывать оверлей с количеством скрытых элементов
  const hiddenCount = attachments.length - visibleAttachments.length;

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
          <div className={`mt-3 ${gridTemplate.grid} gap-2 max-h-[480px] md:max-h-[520px]`}>
            {visibleAttachments.map((m, idx) => {
              const isVisual = isVisualMedia(m);
              return (
                <div
                  key={m.id || m.url}
                  className={`relative overflow-hidden rounded-xl bg-base-200 ${gridTemplate.className} ${
                    isVisual && gridTemplate.aspect ? gridTemplate.aspect : ''
                  }`}
                >
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full"
                    onClick={() => openViewer(idx)}
                    aria-label={`Открыть медиа ${idx + 1}`}
                  >
                    <MediaPlayer
                      media={m}
                      type={m.type}
                      url={m.url}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                  {/* Оверлей с количеством скрытых элементов */}
                  {hiddenCount > 0 && idx === visibleAttachments.length - 1 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold cursor-pointer">
                      +{hiddenCount}
                    </div>
                  )}
                </div>
              );
            })}
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
              className={`btn btn-sm btn-outline btn-error flex items-center justify-center ${deleteLoading ? 'loading' : ''}`}
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
