import { useState } from 'react';

export default function ProfileTabs({ posts, likes, comments }) {
  const [tab, setTab] = useState('posts');
  const tabs = [
    { key: 'posts', label: `Публикации (${posts.length})` },
    { key: 'likes', label: `Лайки (${likes.length})` },
    { key: 'comments', label: `Комментарии (${comments.length})` },
  ];

  return (
    <div>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tab === 'posts' && posts}
        {tab === 'likes' && likes}
        {tab === 'comments' && comments}
      </div>
    </div>
  );
}