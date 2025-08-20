import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import Comment from '@/components/Comment';
import SkeletonPost from '@/components/SkeletonPost';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/comments/post/${id}`),
    ])
      .then(([p, c]) => {
        setPost(p.data);
        setComments(c.data);
      })
      .catch(() => toast.error('Не удалось загрузить пост'));
  }, [id]);

  const handleComment = () => {
    if (!newComment.trim()) return;
    api
      .post('/comments', { postId: id, content: newComment })
      .then(({ data }) => {
        setComments([data, ...comments]);
        setNewComment('');
      })
      .catch(() => toast.error('Ошибка при отправке'));
  };

  const removeComment = (commentId) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  if (!post) return <SkeletonPost />;

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={getAvatarUrl(post.userAvatar)}
          alt="avatar"
          className="w-12 h-12 rounded-full ring ring-primary"
        />
        <div>
          <p className="font-bold text-lg">@{post.username}</p>
          <p className="text-xs text-base-content/60">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-2">{post.title}</h1>
      <p className="text-base-content/90 whitespace-pre-wrap mb-4">{post.content}</p>

      <MediaPlayer url={post.imageUrl} type="image" />
      <MediaPlayer url={post.videoUrl} type="video" />
      <MediaPlayer url={post.audioUrl} type="audio" />

      <hr className="my-8" />

      {/* лайк выводится, но не кликабелен */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`text-lg ${post.isLikedByCurrentUser ? 'text-red-500' : ''}`}>
          {post.isLikedByCurrentUser ? '❤️' : '🤍'} {post.likesCount}
        </span>
        <span className="text-base-content/60">лайков</span>
      </div>

      <h2 className="text-xl font-bold mb-3">Комментарии ({comments.length})</h2>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Напишите комментарий..."
        rows={3}
        className="textarea textarea-bordered w-full mb-2"
      />
      <button onClick={handleComment} className="btn btn-primary mb-6">
        Отправить
      </button>

      <div className="space-y-4">
        {comments.map((c) => (
          <Comment key={c.id} comment={c} onDelete={removeComment} />
        ))}
      </div>
    </motion.div>
  );
}