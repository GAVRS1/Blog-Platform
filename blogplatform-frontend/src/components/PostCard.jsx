import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import MediaPlayer from './MediaPlayer';

export default function PostCard({ post }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="card bg-base-100 shadow-xl mb-6 cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="card-body">
        <div className="flex items-center gap-3">
          <img
            src={post.user?.profilePictureUrl || '/avatar.png'}
            alt="avatar"
            className="w-12 h-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100"
          />
          <div>
            <h3 className="font-bold">{post.user?.username}</h3>
            <span className="text-xs text-base-content/60">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <h2 className="card-title text-primary">{post.title}</h2>
        <p className="text-sm text-base-content/80">{post.content}</p>

        <MediaPlayer url={post.imageUrl} type="image" />
        <MediaPlayer url={post.videoUrl} type="video" />
        <MediaPlayer url={post.audioUrl} type="audio" />

        <div className="card-actions justify-end">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser}
            initialCount={post.likesCount}
          />
          <button className="btn btn-ghost btn-sm gap-1">
            💬 {post.commentsCount}
          </button>
        </div>
      </div>
    </motion.div>
  );
}