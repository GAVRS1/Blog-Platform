// src/pages/PostDetailPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsService } from '@/services/posts';
import { commentsService } from '@/services/comments';
import MediaCollage from '@/components/MediaCollage';
import MediaViewer from '@/components/MediaViewer';
import LikeButton from '@/components/LikeButton';
import Comment from '@/components/Comment';
import ReportModal from '@/components/ReportModal';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';
import { formatPostDateTime } from '@/utils/date';
import { useAuth } from '@/hooks/useAuth';

const PAGE_SIZE = 10;

export default function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);

  const [comments, setComments] = useState([]);
  const [cPage, setCPage] = useState(1);
  const [cTotal, setCTotal] = useState(0);
  const [cLoading, setCLoading] = useState(true);
  const [cSending, setCSending] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [reportOpen, setReportOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    (async () => {
      setLoadingPost(true);
      try {
        const p = await postsService.getById(postId);
        setPost(p);
      } catch (e) {
        toast.error(e.response?.data || 'Пост не найден');
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [postId]);

  useEffect(() => {
    loadComments(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function loadComments(page = 1, replace = false) {
    setCLoading(true);
    try {
      const res = await commentsService.listByPost(postId, page, PAGE_SIZE);
      const items = res.items || [];
      setComments((prev) => (replace ? items : [...prev, ...items]));
      setCPage(page);
      setCTotal(res.total ?? items.length);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить комментарии');
    } finally {
      setCLoading(false);
    }
  }

  const author = useMemo(() => post ? ({
    id: post.userId,
    name: post.userFullName ?? post.username,
    avatar: getAvatarUrl(post.userAvatar)
  }) : null, [post]);

  const attachments = useMemo(() => post?.attachments || post?.media || [], [post]);
  const onLikeChange = (r) => {
    setPost((p) => p ? ({ ...p, isLikedByCurrentUser: !!r.liked, likeCount: r.count ?? p.likeCount }) : p);
  };

  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const onSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCSending(true);
    try {
      const saved = await commentsService.create({ postId, content: newComment.trim() });
      setNewComment('');
      setPost((p) => p ? ({ ...p, commentCount: (p.commentCount || 0) + 1 }) : p);
      setComments((prev) => [saved, ...prev]);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) toast.error('Слишком часто. Попробуйте позже.');
      else if (status === 403) toast.error('Автор ограничил комментирование');
      else toast.error(err.response?.data || 'Не удалось отправить комментарий');
    } finally {
      setCSending(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setPost((p) => p ? ({ ...p, commentCount: Math.max((p.commentCount || 1) - 1, 0) }) : p);
    setCTotal((total) => Math.max(total - 1, 0));
  };

  const canLoadMore = comments.length < cTotal;

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          {loadingPost && (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner text-primary" />
            </div>
          )}

          {!loadingPost && post && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link to={`/users/${author.id}`} className="avatar">
                    <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                      <img src={author.avatar} alt={author.name} />
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/users/${author.id}`} className="font-semibold hover:underline block truncate">
                      {author.name}
                    </Link>
                    <div className="text-xs opacity-60">{formatPostDateTime(post.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => setReportOpen(true)}>
                    Пожаловаться
                  </button>
                </div>
              </div>

              {post.content && (
                <div className="mt-3 whitespace-pre-wrap break-words">{post.content}</div>
              )}

              {attachments.length > 0 && (
                <div className="mt-3">
                  <MediaCollage items={attachments} onOpen={openViewer} />
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <LikeButton
                  type="post"
                  targetId={post.id}
                  initialLiked={post.isLikedByCurrentUser}
                  initialCount={post.likeCount}
                  onChange={onLikeChange}
                />
                <div className="btn btn-sm btn-ghost">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-comment" aria-hidden="true"></i>
                    <span>{post.commentCount ?? 0}</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={onSendComment} className="card bg-base-100 shadow">
        <div className="card-body">
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Напишите комментарий…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="card-actions justify-end">
            <button className={`btn btn-primary btn-sm ${cSending ? 'loading' : ''}`} disabled={cSending}>
              Отправить
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map(c => (
          <Comment
            key={c.id}
            comment={c}
            enableLike
            currentUserId={user?.id}
            postUserId={post?.userId}
            onDeleted={handleCommentDeleted}
          />
        ))}

        {cLoading && (
          <div className="flex justify-center py-6"><span className="loading loading-spinner text-primary" /></div>
        )}

        {!cLoading && canLoadMore && (
          <div className="flex justify-center">
            <button className="btn btn-outline btn-sm" onClick={() => loadComments(cPage + 1)}>
              Показать ещё
            </button>
          </div>
        )}

        {!cLoading && comments.length === 0 && (
          <div className="text-center opacity-60 py-8">Будьте первым, кто оставит комментарий</div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        subject={{ type: 'post', postId }}
      />
      <MediaViewer
        open={viewerOpen}
        items={attachments}
        startIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
