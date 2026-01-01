// src/components/PostCard.jsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeButton from '@/components/LikeButton';
import MediaPlayer from '@/components/MediaPlayer';
import toast from 'react-hot-toast';

export default function PostCard({ post, onDeleted }) {
  const navigate = useNavigate();
  const [local, setLocal] = useState(() => ({
    likeCount: post.likeCount ?? 0,
    commentCount: post.commentCount ?? 0,
    isLiked: !!post.isLikedByCurrentUser
  }));

  const attachments = useMemo(() => post.attachments || post.media || [], [post]);

  const author = useMemo(() => ({
    id: post.userId,
    name: post.username,
    avatar: post.userAvatar
  }), [post]);

  const onLikeChange = (res) => {
    setLocal((s) => ({ ...s, isLiked: !!res.liked, likeCount: res.count ?? s.likeCount }));
  };

  const openDetails = () => navigate(`/posts/${post.id}`);

  return (
    <article className="card bg-base-100 shadow-sm hover:shadow transition">
      <div className="card-body p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to={`/users/${author.id}`} className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
              <img src={author.avatar || '/avatar.png'} alt={author.name} />
            </div>
          </Link>
          <div className="min-w-0">
            <Link to={`/users/${author.id}`} className="font-semibold hover:underline block truncate">
              @{author.name}
            </Link>
            <div className="text-xs opacity-60">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <div className="mt-3 whitespace-pre-wrap break-words">{post.content}</div>
        )}

        {/* Media */}
        {attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((m) => (
              <MediaPlayer key={m.id || m.url} media={m} type={m.type} url={m.url} />
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
              💬 <span className="ml-2">{local.commentCount}</span>
            </button>
          </div>

          {/* Если это мой пост — можно удалить (если у тебя есть такая логика) */}
          {post.isOwn && (
            <button
              className="btn btn-sm btn-outline btn-error"
              onClick={() => onDeleted?.(post)}
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
