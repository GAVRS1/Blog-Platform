import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import Comment from '@/components/Comment';
import MediaPlayer from '@/components/MediaPlayer';
import SkeletonPost from '@/components/SkeletonPost';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/comments/post/${id}`),
    ]);
    setPost(p.data);
    setComments(c.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post('/comments', {
        postId: id,
        content: newComment,
      });
      setComments([data, ...comments]);
      setNewComment('');
    } catch {
      toast.error('Не удалось отправить комментарий');
    }
  };

  if (!post) return <SkeletonPost />;

  // аватар автора
  const authorAvatar = post.userAvatar
    ? `${import.meta.env.VITE_API_BASE}/uploads/${post.userAvatar.replace(/\\/g, '/')}`
    : '/avatar.png';

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* META */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={authorAvatar}
          alt="avatar"
          className="w-12 h-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100"
        />
        <div>
          <p className="font-bold text-lg">{post.username}</p>
          <p className="text-xs text-base-content/60">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <h1 className="text-3xl font-bold text-primary mb-2">{post.title}</h1>
      <p className="text-base-content/80 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* MEDIA */}
      <MediaPlayer url={post.imageUrl} type="image" />
      <MediaPlayer url={post.videoUrl} type="video" />
      <MediaPlayer url={post.audioUrl} type="audio" />

      {/* LIKES */}
      <div className="flex justify-end mt-4">
        <span className="text-sm text-base-content/60">
          ❤️ {post.likeCount} &nbsp; 💬 {post.commentCount}
        </span>
      </div>

      <hr className="my-6" />

      {/* COMMENTS */}
      <h2 className="text-xl font-bold mb-3">Комментарии ({comments.length})</h2>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Напишите комментарий..."
        rows={3}
        className="textarea textarea-bordered w-full mb-2"
      />
      <button onClick={handleComment} className="btn btn-primary mb-4">
        Отправить
      </button>

      <div className="space-y-4">
        {comments.map((c) => (
          <Comment key={c.id} comment={c} onReply={load} />
        ))}
      </div>
    </motion.div>
  );
}