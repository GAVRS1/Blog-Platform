import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import Comment from '@/components/Comment';
import MediaPlayer from '@/components/MediaPlayer';
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

  return (
    <motion.div className="post-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>{post.title}</h1>
      <p className="post-meta">
        @{post.user?.username} · {new Date(post.createdAt).toLocaleString()}
      </p>

      <p>{post.content}</p>

      <MediaPlayer url={post.imageUrl} type="image" />
      <MediaPlayer url={post.videoUrl} type="video" />
      <MediaPlayer url={post.audioUrl} type="audio" />

      <section className="comments-section">
        <h3>Комментарии ({comments.length})</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Напишите комментарий..."
          rows={3}
        />
        <button onClick={handleComment}>Отправить</button>

        {comments.map((c) => (
          <Comment key={c.id} comment={c} onReply={load} />
        ))}
      </section>
    </motion.div>
  );
}