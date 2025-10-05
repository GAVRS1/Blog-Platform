// src/components/ProfileTabs.jsx
import { useEffect, useMemo, useState } from 'react';
import PostCard from '@/components/PostCard';
import SkeletonPost from '@/components/SkeletonPost';
import { postsService } from '@/services/posts';

const PAGE_SIZE = 10;

export default function ProfileTabs({ user, active = 'posts' }) {
  const [tab, setTab] = useState(active);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [loading, setLoading] = useState(true);

  const mediaItems = useMemo(
    () => data.items.flatMap(p => (p.media || []).map(m => ({ ...m, postId: p.id, createdAt: p.createdAt })) ),
    [data.items]
  );

  useEffect(() => {
    load(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function load(page = 1, replace = false) {
    setLoading(true);
    try {
      const res = await postsService.listByUser(user.id, page, PAGE_SIZE);
      setData(prev => ({
        ...(replace ? res : { ...res, items: [...(prev.items || []), ...(res.items || [])] })
      }));
    } finally {
      setLoading(false);
    }
  }

  const pages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || PAGE_SIZE)));

  return (
    <div className="space-y-4">
      {/* Tabs header */}
      <div role="tablist" className="tabs tabs-bordered">
        <button role="tab" className={`tab ${tab === 'posts' ? 'tab-active' : ''}`} onClick={() => setTab('posts')}>
          Посты
        </button>
        <button role="tab" className={`tab ${tab === 'media' ? 'tab-active' : ''}`} onClick={() => setTab('media')}>
          Медиа
        </button>
        <button role="tab" className={`tab ${tab === 'about' ? 'tab-active' : ''}`} onClick={() => setTab('about')}>
          О пользователе
        </button>
      </div>

      {/* Content */}
      {tab === 'posts' && (
        <>
          {loading && data.page === 1 && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonPost key={i} />)}
            </div>
          )}

          {!loading && data.items.length === 0 && (
            <div className="text-center opacity-60 py-8">Постов пока нет</div>
          )}

          {data.items.map(p => <PostCard key={p.id} post={p} />)}

          {pages > data.page && (
            <div className="flex justify-center">
              <button className="btn btn-outline btn-sm" onClick={() => load((data.page || 1) + 1)}>
                Показать ещё
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'media' && (
        <>
          {loading && data.page === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-40 w-full rounded" />
              ))}
            </div>
          )}

          {!loading && mediaItems.length === 0 && (
            <div className="text-center opacity-60 py-8">Медиа не найдено</div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {mediaItems.map((m, i) => (
              <MediaThumb key={`${m.postId}-${i}`} media={m} />
            ))}
          </div>

          {pages > data.page && (
            <div className="flex justify-center mt-3">
              <button className="btn btn-outline btn-sm" onClick={() => load((data.page || 1) + 1)}>
                Показать ещё
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'about' && (
        <div className="card bg-base-100">
          <div className="card-body">
            <Lines label="Полное имя" value={user?.profile?.fullName || '—'} />
            <Lines label="О себе" value={user?.profile?.bio || '—'} />
            <Lines label="Дата рождения" value={user?.profile?.birthDate ? new Date(user.profile.birthDate).toLocaleDateString() : '—'} />
            <Lines label="Статус" value={user?.status || '—'} />
          </div>
        </div>
      )}
    </div>
  );
}

function Lines({ label, value }) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-base-300/60 last:border-none">
      <div className="w-40 opacity-70">{label}</div>
      <div className="flex-1">{value}</div>
    </div>
  );
}

function MediaThumb({ media }) {
  if (media.mediaType === 'Image') {
    return <img src={media.url} alt="" className="rounded-lg w-full h-40 object-cover" />;
  }
  if (media.mediaType === 'Video') {
    return <video src={media.url} className="rounded-lg w-full h-40 object-cover" />;
  }
  if (media.mediaType === 'Audio') {
    return (
      <div className="rounded-lg p-3 bg-base-100 border border-base-300">
        <audio src={media.url} controls className="w-full" />
      </div>
    );
  }
  return (
    <a href={media.url} target="_blank" rel="noreferrer" className="rounded-lg p-3 bg-base-100 border border-base-300 block truncate">
      Файл
    </a>
  );
}
