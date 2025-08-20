import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import LikeButton from '@/components/LikeButton';

export default function PostCard({ post }) {
  return (
    <motion.div
      className="card bg-base-100 shadow-xl mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-body">
        <div className="flex items-center gap-3">
          <img
            src={getAvatarUrl(post.userAvatar)}
            alt={post.username}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <Link to={`/user/${post.userId}`} className="font-bold">
              @{post.username}
            </Link>
            <p className="text-xs text-base-content/60">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <Link to={`/post/${post.id}`}>
          <h2 className="card-title text-primary">{post.title}</h2>
        </Link>

        <p className="text-base-content/90 whitespace-pre-line">{post.content}</p>

        <MediaPlayer url={post.imageUrl} type="image" />
        <MediaPlayer url={post.videoUrl} type="video" />
        <MediaPlayer url={post.audioUrl} type="audio" />

        <div className="card-actions justify-end items-center">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLikedByCurrentUser}
            initialCount={post.likesCount}
          />
          <Link to={`/post/${post.id}`} className="btn btn-ghost btn-sm">
            💬 {post.commentsCount}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}