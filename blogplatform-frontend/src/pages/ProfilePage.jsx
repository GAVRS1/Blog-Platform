// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyData } from '@/hooks/useMyData';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';
import SkeletonPost from '@/components/SkeletonPost';
import PostCard from '@/components/PostCard';
import EditProfileModal from '@/components/EditProfileModal';

const tabs = [
  { key: 'posts', label: 'Публикации', endpoint: 'posts/user/me', icon: 'fas fa-file-alt' },
  { key: 'likes', label: 'Лайки', endpoint: 'Users/me/liked-posts', icon: 'fas fa-heart' },
  { key: 'comments', label: 'Комментарии', endpoint: 'Users/me/commented-posts', icon: 'fas fa-comments' },
];

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('posts');
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const currentTab = tabs.find(t => t.key === tab);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyData(currentTab.endpoint);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['my-data', currentTab.endpoint] });
  }, [tab, currentTab.endpoint, queryClient]);

  const items = data?.pages.flat() ?? [];

  const renderTabContent = () => {
    if (tab === 'posts') {
      return items.map(post => (
        <PostCard key={post.id} post={post} />
      ));
    }
    if (tab === 'likes') {
      return items.map(post => (
        <PostCard key={post.id} post={post} />
      ));
    }
    if (tab === 'comments') {
      return items.map(post => (
        <PostCard key={post.id} post={post} />
      ));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  const profileAvatarUrl = getAvatarUrl(user.profile?.profilePictureUrl);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Карточка профиля */}
      <div className="bg-base-100 rounded-lg shadow-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={profileAvatarUrl}
            alt={user.fullName}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 aspect-square self-center md:self-start"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-base-content mb-2">{user.fullName}</h1>
            <p className="text-base-content/80 mb-3">@{user.username}</p>
            {user.profile?.bio && (
              <p className="text-base-content mb-4">{user.profile.bio}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center md:justify-start">
              <div className="flex gap-6 text-sm text-base-content/70">
                <span>
                  <i className="fas fa-calendar mr-1"></i>
                  {user.profile?.birthDate ? 
                    new Date(user.profile.birthDate).toLocaleDateString('ru-RU') : 
                    'Не указана'}
                </span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary btn-sm md:btn-md"
              >
                <i className="fas fa-edit mr-2"></i>
                Редактировать
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Вкладки и контент */}
      <div className="bg-base-100 rounded-lg shadow-xl overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide border-b border-base-300">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-200 whitespace-nowrap min-w-[120px] ${
                tab === tabItem.key
                  ? 'bg-primary text-white border-b-2 border-primary'
                  : 'text-base-content/70 hover:text-primary hover:bg-base-200'
              }`}
            >
              <i className={`${tabItem.icon} mr-2`}></i>
              <span className="hidden sm:inline">{tabItem.label}</span>
              <span className="sm:hidden">{tabItem.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        <div className="p-4 md:p-6">
          {items.length === 0 && !isFetchingNextPage ? (
            <div className="text-center py-12">
              <i className={`${currentTab.icon} text-4xl md:text-6xl text-base-content/30 mb-4`}></i>
              <h3 className="text-lg md:text-xl font-semibold text-base-content/70 mb-2">
                {tab === 'posts' && 'Пока нет публикаций'}
                {tab === 'likes' && 'Пока нет лайков'}
                {tab === 'comments' && 'Пока нет комментариев'}
              </h3>
              <p className="text-base-content/60 text-sm md:text-base">
                {tab === 'posts' && 'Создайте свой первый пост!'}
                {tab === 'likes' && 'Начните лайкать интересные посты!'}
                {tab === 'comments' && 'Поделитесь своим мнением в комментариях!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {renderTabContent()}
              {isFetchingNextPage && (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <SkeletonPost key={i} />
                  ))}
                </div>
              )}
              {hasNextPage && (
                <div className="text-center pt-6">
                  <button
                    onClick={fetchNextPage}
                    className="btn btn-outline btn-primary"
                  >
                    Загрузить еще
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <EditProfileModal
          onClose={() => setShowModal(false)}
          onSaved={() => setShowModal(false)}
        />
      )}
    </div>
  );
}