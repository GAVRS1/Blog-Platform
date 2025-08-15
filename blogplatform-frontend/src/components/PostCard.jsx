// src/components/PostCard.jsx
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import MediaPlayer from './MediaPlayer';

export default function PostCard({ post }) {
  const navigate = useNavigate();

  return (
    <article className="post-card">
      <header className="post-header">
        <img
          src={post.user?.profilePictureUrl || '/avatar.png'}
          alt="avatar"
          className="avatar"
        />
        <div>
          <strong>{post.user?.username}</strong>
          <span className="date">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </header>

      <h3 className="post-title" onClick={() => navigate(`/post/${post.id}`)}>
        {post.title}
      </h3>

      <p className="post-content">{post.content}</p>

      <MediaPlayer url={post.imageUrl} type="image" />
      <MediaPlayer url={post.videoUrl} type="video" />
      <MediaPlayer url={post.audioUrl} type="audio" />

      <footer className="post-footer">
        <LikeButton
          postId={post.id}
          initialLiked={post.isLikedByCurrentUser}
          initialCount={post.likesCount}
        />
        <span className="comments-count">💬 {post.commentsCount}</span>
      </footer>
    </article>
  );
}