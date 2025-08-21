// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyData } from '@/hooks/useMyData';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar'; // Убедиться, что импортировано
import SkeletonPost from '@/components/SkeletonPost';
import PostCard from '@/components/PostCard';
import Comment from '@/components/Comment';
import EditProfileModal from '@/components/EditProfileModal';

// Обновленные эндпоинты (используем правильные пути)
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

  // Эффект для инвалидации кэша при смене вкладки
  useEffect(() => {
    // Принудительно обновляем данные при смене вкладки
    queryClient.invalidateQueries({ queryKey: ['my-data', currentTab.endpoint] });
  }, [tab, currentTab.endpoint, queryClient]); // <-- Корректные зависимости

  const items = data?.pages.flat() ?? [];

  // Функция для рендера контента в зависимости от типа вкладки
  const renderTabContent = () => {
    if (tab === 'posts') {
      return items.map(post => (
        <PostCard key={post.id} post={post} />
      ));
    }
    
    if (tab === 'likes') {
      // items - это массив постов, которые пользователь лайкнул
      return items.map(post => (
        <PostCard key={post.id} post={post} />
      ));
    }
    
    if (tab === 'comments') {
      // items - это массив постов, в которых пользователь оставил комментарий
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

  // Используем getAvatarUrl для аватара профиля
  const profileAvatarUrl = getAvatarUrl(user.profile?.profilePictureUrl);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Карточка профиля */}
      <div className="bg-base-100 rounded-lg shadow-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <img
            src={profileAvatarUrl} // Используем обработанный URL
            alt={user.fullName}
            // Добавим object-cover и aspect-square для предотвращения растягивания
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 aspect-square"
          />
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-base-content">{user.fullName}</h1>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-outline btn-primary"
              >
                <i className="fas fa-edit mr-2"></i>
                Редактировать
              </button>
            </div>
            
            <p className="text-base-content/80 mb-2">@{user.username}</p>
            
            {user.profile?.bio && (
              <p className="text-base-content mb-4">{user.profile.bio}</p>
            )}
            
            <div className="flex gap-6 text-sm text-base-content/70">
              <span>
                <i className="fas fa-calendar mr-1"></i>
                Дата рождения: {user.profile?.birthDate ? 
                  new Date(user.profile.birthDate).toLocaleDateString('ru-RU') : 
                  'Не указана'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Вкладки и контент */}
      <div className="bg-base-100 rounded-lg shadow-xl">
        <div className="flex border-b border-base-300">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                tab === tabItem.key
                  ? 'bg-primary text-white border-b-2 border-primary'
                  : 'text-base-content/70 hover:text-primary hover:bg-base-200'
              }`}
            >
              <i className={`${tabItem.icon} mr-2`}></i>
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {items.length === 0 && !isFetchingNextPage ? (
            <div className="text-center py-12">
              <i className={`${currentTab.icon} text-6xl text-base-content/30 mb-4`}></i>
              <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                {tab === 'posts' && 'Пока нет публикаций'}
                {tab === 'likes' && 'Пока нет лайков'}
                {tab === 'comments' && 'Пока нет комментариев'}
              </h3>
              <p className="text-base-content/60">
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