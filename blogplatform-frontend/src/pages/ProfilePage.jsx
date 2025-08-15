// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    const userRes = await api.get('/users/me');
    setUser(userRes.data);
    const postsRes = await api.get(`/posts/user/${userRes.data.id}`);
    setPosts(postsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user) return <p>Загрузка...</p>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <img
          src={user.profilePictureUrl || '/avatar.png'}
          alt="avatar"
          className="profile-avatar"
        />
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>{user.fullName}</p>
          <p>📝 {posts.length} публикаций</p>
          <p>💬 {user.commentsCount} комментариев</p>
        </div>
        <button className="btn-edit" onClick={() => setShowModal(true)}>
          Редактировать
        </button>
      </header>

      <main className="profile-posts">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </main>

      {showModal && (
        <EditProfileModal onClose={() => setShowModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}