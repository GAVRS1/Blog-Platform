import { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const loadPosts = () => {
    api.get('/posts')
      .then(res => setPosts(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Лента</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Новый пост
        </button>
      </header>

      <main className="posts-list">
        {posts.length === 0 && <p className="empty">Постов пока нет</p>}
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={loadPosts}
        />
      )}
    </div>
  );
}