import { useEffect, useState } from 'react';
import api from '@/api/axios';
import PostCard from '@/components/PostCard';
import EditProfileModal from '@/components/EditProfileModal';
import ProfileTabs from '@/components/ProfileTabs';
import SkeletonPost from '@/components/SkeletonPost';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      const [u, p, l, c] = await Promise.all([
        api.get('/users/me'),
        api.get('/posts/user/me'),
        api.get('/likes/me'),
        api.get('/comments/me'),
      ]);
      setUser(u.data);
      setPosts(p.data);
      setLikes(l.data);
      setComments(c.data);
    })();
  }, []);

  if (!user) return <SkeletonPost />;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <img src={user.profilePictureUrl || '/avatar.png'} alt="avatar" />
        <div>
          <h2>{user.username}</h2>
          <p>{user.fullName}</p>
        </div>
        <button onClick={() => setShowModal(true)}>Редактировать</button>
      </header>

      <ProfileTabs
        posts={posts.map((p) => <PostCard key={p.id} post={p} />)}
        likes={likes.map((l) => (
          <PostCard key={l.id} post={l.post} />
        ))}
        comments={comments.map((c) => (
          <div key={c.id} className="comment-card">
            <p>{c.content}</p>
            <PostCard post={c.post} />
          </div>
        ))}
      />

      {showModal && (
        <EditProfileModal onClose={() => setShowModal(false)} onSaved={() => window.location.reload()} />
      )}
    </div>
  );
}