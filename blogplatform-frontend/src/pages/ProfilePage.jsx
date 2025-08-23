// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyData } from '@/hooks/useMyData';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';
import SkeletonPost from '@/components/SkeletonPost';
import PostCard from '@/components/PostCard';
import EditProfileModal from '@/components/EditProfileModal';

// Используем рабочие endpoint'ы, предоставленные вами
const tabs = [
  { key: 'posts', label: 'Публикации', endpoint: 'posts/user/me', icon: 'fas fa-file-alt' },
  { key: 'likes', label: 'Лайки', endpoint: 'Users/me/liked-posts', icon: 'fas fa-heart' }, // Исправлено на ваш endpoint
  { key: 'comments', label: 'Комментарии', endpoint: 'Users/me/commented-posts', icon: 'fas fa-comments' }, // Исправлено на ваш endpoint
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
    invalidate
  } = useMyData(currentTab.endpoint);

  // Удален избыточный useEffect

  const items = data?.pages.flat() ?? [];

  const handlePostDeleted = (postId) => {
    invalidate(); 
  };

  const renderTabContent = () => {
    if (tab === 'posts') {
      return items.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDelete={handlePostDeleted}
        />
      ));
    }
    // Предполагаем, что Users/me/liked-posts и Users/me/commented-posts возвращают список постов
    // Если структура ответа отличается, useMyData должен это обработать.
    if (tab === 'likes') {
      return items.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDelete={handlePostDeleted}
        />
      ));
    }
    if (tab === 'comments') {
      return items.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDelete={handlePostDeleted}
        />
      ));
    }
    return null;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // Приоритетное отображение fullName, fallback на username
  const displayName = user.profile?.fullName || user.fullName || user.username || 'Имя не указано';
  const profileAvatarUrl = getAvatarUrl(user.profile?.profilePictureUrl);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* Профильная карточка с улучшенной симметрией */}
      <div className="bg-base-100/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-base-300/30 p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
          {/* Аватар - Удален большой фиолетовый кружок */}
          <div className="relative">
            <img
              src={profileAvatarUrl}
              alt={displayName}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg aspect-square"
              onError={({ currentTarget }) => {
                 currentTarget.onerror = null; // prevents looping
                 currentTarget.src="/avatar.png";
               }}
            />
            {/* Фиолетовый кружок удален */}
          </div>
          
          {/* Информация о пользователе */}
          <div className="space-y-2 sm:space-y-3 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">{displayName}</h1>
            <p className="text-base sm:text-lg text-base-content/70">@{user.username || 'username'}</p>
            {user.profile?.bio && (
              <p className="text-sm sm:text-base text-base-content/80 leading-relaxed px-4">
                {user.profile.bio}
              </p>
            )}
            
            {/* Дата рождения */}
            <div className="flex justify-center items-center gap-2 text-xs sm:text-sm text-base-content/60">
              <i className="fas fa-calendar"></i>
              <span>
                {user.profile?.birthDate ? 
                  `Дата рождения: ${new Date(user.profile.birthDate).toLocaleDateString('ru-RU')}` : 
                  'Дата рождения не указана'
                }
              </span>
            </div>
          </div>
          
          {/* Кнопка редактирования */}
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-wide shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <i className="fas fa-edit mr-2"></i>
            Редактировать профиль
          </button>
        </div>
      </div>

      {/* Симметричные вкладки с закруглением */}
      <div className="bg-base-100/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-base-300/30 overflow-hidden">
        {/* Заголовок вкладок */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300/30">
          <div className="flex">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`flex-1 py-4 sm:py-6 px-3 sm:px-6 text-center font-medium transition-all duration-300 relative overflow-hidden ${
                  tab === tabItem.key
                    ? 'text-primary bg-primary/10'
                    : 'text-base-content/70 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {/* Активный индикатор */}
                {tab === tabItem.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <i className={`${tabItem.icon} text-base sm:text-lg`}></i>
                  <span className="text-xs sm:text-sm font-semibold">{tabItem.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Контент вкладок */}
        <div className="p-4 sm:p-6">
          {items.length === 0 && !isFetchingNextPage ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-base-200 flex items-center justify-center">
                <i className={`${currentTab.icon} text-2xl sm:text-3xl text-base-content/30`}></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-base-content/70 mb-2">
                {tab === 'posts' && 'Пока нет публикаций'}
                {tab === 'likes' && 'Пока нет лайков'}
                {tab === 'comments' && 'Пока нет комментариев'}
              </h3>
              <p className="text-sm sm:text-base text-base-content/50 max-w-sm mx-auto">
                {tab === 'posts' && 'Создайте свой первый пост, чтобы поделиться с другими'}
                {tab === 'likes' && 'Начните лайкать интересные посты'}
                {tab === 'comments' && 'Поделитесь своим мнением в комментариях'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {renderTabContent()}
              {isFetchingNextPage && (
                <div className="space-y-4 sm:space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <SkeletonPost key={i} />
                  ))}
                </div>
              )}
              {hasNextPage && (
                <div className="text-center pt-4 sm:pt-6">
                  <button
                    onClick={() => fetchNextPage()}
                    className="btn btn-outline btn-primary btn-wide"
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
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
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}