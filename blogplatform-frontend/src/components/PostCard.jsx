import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import MediaPlayer from './MediaPlayer';

export default function PostCard({ post }) {
  const navigate = useNavigate();

  // абсолютный URL аватара
  const avatarUrl = post.userAvatar
    ? `${import.meta.env.VITE_API_BASE}${post.userAvatar}`
    : '/avatar.png';

  return (
    <motion.div
      className="card bg-base-100 shadow-xl mb-6 cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="card-body">
        {/* Аватар + имя */}
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-12 h-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100"
          />
          <div>
            <h3 className="font-bold">{post.username}</h3>
            <span className="text-xs text-base-content/60">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Заголовок и текст */}
        <h2 className="card-title text-primary">{post.title}</h2>
        <p className="text-sm text-base-content/80">{post.content}</p>

        {/* Медиа-контент */}
        <MediaPlayer url={post.imageUrl} type="image" />
        <MediaPlayer url={post.videoUrl} type="video" />
        <MediaPlayer url={post.audioUrl} type="audio" />

        {/* Лайки и комменты */}
        <div className="card-actions justify-end">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser}
            initialCount={post.likesCount}
          />
          <button className="btn btn-ghost btn-sm gap-1">
            💬 {post.commentCount}
          </button>
        </div>
      </div>
    </motion.div>
  );
}