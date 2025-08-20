import { useState } from 'react';
import { useMyData } from '@/hooks/useMyData';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';
import SkeletonPost from '@/components/SkeletonPost';
import PostCard from '@/components/PostCard';
import EditProfileModal from '@/components/EditProfileModal';

const tabs = [
  { key: 'posts', label: 'Публикации', endpoint: 'posts/user/me' },
  { key: 'likes', label: 'Лайки', endpoint: 'likes/me' },
  { key: 'comments', label: 'Комментарии', endpoint: 'comments/me' },
];

export default function ProfilePage() {
  const [tab, setTab] = useState('posts');
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyData(tabs.find((t) => t.key === tab).endpoint);

  const items = data?.pages.flat() ?? [];

  if (!user) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={getAvatarUrl(user?.profile?.profilePictureUrl)}
          alt="avatar"
          className="w-20 h-20 rounded-full ring ring-primary"
        />
        <div>
          <h1 className="text-2xl font-bold">{user?.profile?.fullName}</h1>
          <p className="text-sm text-base-content/70">@{user.username}</p>
          <p className="text-sm text-base-content/70">{user.profile?.bio}</p>
          {user.profile?.birthDate && (
            <p className="text-sm text-base-content/70">
              Дата рождения: {new Date(user.profile.birthDate).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-outline btn-primary btn-sm mt-2"
          >
            Редактировать
          </button>
        </div>
      </div>

      <div className="tabs tabs-boxed mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === 'posts' && items.map((p) => <PostCard key={p.id} post={p} />)}
        {tab === 'likes' && items.map((l) => <PostCard key={l.post.id} post={l.post} />)}
        {tab === 'comments' &&
          items.map((c) => (
            <div key={c.id} className="card bg-base-100 shadow p-4">
              <p className="mb-2">{c.content}</p>
              <PostCard post={c.post} />
            </div>
          ))}

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