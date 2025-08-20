import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import LikeButton from '@/components/LikeButton';

export default function PostCard({ post }) {
  return (
    <motion.div
      className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 mb-6 overflow-hidden hover:shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-body p-6">
        {/* Заголовок поста */}
        <motion.div
          className="flex items-center gap-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.img
            src={getAvatarUrl(post.userAvatar)}
            alt={post.username}
            className="w-12 h-12 rounded-full border-2 border-primary/20 shadow-md"
            whileHover={{ scale: 1.1, borderColor: 'var(--primary)' }}
          />
          <div className="flex-1">
            <Link 
              to={`/user/${post.userId}`} 
              className="font-bold text-base-content hover:text-primary transition-colors duration-200"
            >
              @{post.username}
            </Link>
            <p className="text-xs text-base-content/60">
              {new Date(post.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
          <div className="badge badge-primary badge-outline">
            {post.contentType}
          </div>
        </motion.div>

        {/* Заголовок */}
        {post.title && (
          <motion.h2 
            className="card-title text-xl font-bold text-base-content mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to={`/post/${post.id}`}
              className="hover:text-primary transition-colors duration-200"
            >
              {post.title}
            </Link>
          </motion.h2>
        )}

        {/* Контент */}
        {post.content && (
          <motion.p 
            className="text-base-content/80 mb-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {post.content.length > 200 
              ? `${post.content.substring(0, 200)}...` 
              : post.content
            }
          </motion.p>
        )}

        {/* Медиа */}
        {post.fileUrl && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <MediaPlayer
              url={post.fileUrl}
              type={post.fileType}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </motion.div>
        )}

        {/* Действия */}
        <motion.div
          className="flex items-center justify-between pt-4 border-t border-base-300/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LikeButton
            postId={post.id}
            initialLiked={post.isLiked}
            initialCount={post.likesCount || 0}
          />
          
          <Link
            to={`/post/${post.id}`}
            className="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-primary"
          >
            💬 {post.commentsCount || 0}
          </Link>
          
          <button className="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-primary">
            📤 Поделиться
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
