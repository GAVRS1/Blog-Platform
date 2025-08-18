import { useState } from 'react';
import { useMyData } from '@/hooks/useMyData';
import SkeletonPost from '@/components/SkeletonPost';
import PostCard from '@/components/PostCard';
import Comment from '@/components/Comment';
import EditProfileModal from '@/components/EditProfileModal';

const tabs = [
  { key: 'posts',   label: 'Публикации', endpoint: 'posts/user/me' },
  { key: 'likes',   label: 'Лайки',      endpoint: 'likes/me'      },
  { key: 'comments',label: 'Комментарии',endpoint: 'comments/me'   },
];

export default function ProfilePage() {
  const [tab, setTab] = useState('posts');
  const [showModal, setShowModal] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyData(
    tabs.find(t => t.key === tab).endpoint
  );

  const items = data?.pages.flat() ?? [];
  const { user } = useAuth();      // ← чтобы показать настоящее имя

  // аватар
  const avatarUrl = user?.profile?.profilePictureUrl
    ? `${import.meta.env.VITE_API_BASE}/uploads/${user.profile.profilePictureUrl.replace(/\\/g, '/')}`
    : '/avatar.png';

  const renderContent = () => {
    switch (tab) {
      case 'posts':
        return items.map(p => <PostCard key={p.id} post={p} />);
      case 'likes':
        return items.map(l => <PostCard key={l.id} post={l.post} />);
      case 'comments':
        return items.map(c => (
          <div key={c.id} className="card bg-base-100 shadow mb-4 p-4">
            <p className="mb-2">{c.content}</p>
            <PostCard post={c.post} />
          </div>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-20 h-20 rounded-full ring ring-primary"
        />
        <div>
          <h1 className="text-2xl font-bold">@{user?.username ?? 'username'}</h1>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-outline btn-primary btn-sm mt-2"
          >
            Редактировать
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs tabs-boxed mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="space-y-6">
        {renderContent()}
        {isFetchingNextPage && [...Array(3)].map((_, i) => <SkeletonPost key={i} />)}
        {!isFetchingNextPage && !hasNextPage && items.length === 0 && (
          <p className="text-center text-base-content/60">Пока пусто 😴</p>
        )}
      </div>

      {showModal && (
        <EditProfileModal
          onClose={() => setShowModal(false)}
          onSaved={() => window.location.reload()}
        />
      )}
    </div>
  );
}