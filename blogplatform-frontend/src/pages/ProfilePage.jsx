import { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Удаляем этот useEffect, так как интерцептор в axios.js уже обрабатывает токен
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // }, []);

  const loadData = async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/posts/user/me')
      ]);
      setUser(userRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
      
    }
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
