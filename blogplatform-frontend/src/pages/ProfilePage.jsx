// src/pages/ProfilePage.jsx - УЛУЧШЕННАЯ ВЕРСИЯ
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useMyData } from '@/hooks/useMyData';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';
import SkeletonPost from '@/components/SkeletonPost';
import PostCard from '@/components/PostCard';
import EditProfileModal from '@/components/EditProfileModal';

const tabs = [
  { key: 'posts', label: 'Публикации', endpoint: 'posts/user/me', icon: '📝', count: 0 },
  { key: 'likes', label: 'Лайки', endpoint: 'Users/me/liked-posts', icon: '❤️', count: 0 },
  { key: 'comments', label: 'Комментарии', endpoint: 'Users/me/commented-posts', icon: '💬', count: 0 },
];

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('posts');
  const [showModal, setShowModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user } = useAuth();
  
  const currentTab = tabs.find(t => t.key === tab);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidate
  } = useMyData(currentTab.endpoint);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['my-data', currentTab.endpoint] });
  }, [tab, currentTab.endpoint, queryClient]);

  const items = data?.pages.flat() ?? [];

  const handlePostDeleted = (postId) => {
    invalidate();
  };

  const renderTabContent = () => {
    if (!items.length && !isFetchingNextPage) {
      return (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">{currentTab.icon}</div>
          <h3 className="text-xl font-semibold text-base-content/70 mb-2">
            {tab === 'posts' && 'Пока нет публикаций'}
            {tab === 'likes' && 'Пока нет лайков'}  
            {tab === 'comments' && 'Пока нет комментариев'}
          </h3>
          <p className="text-base-content/50">
            {tab === 'posts' && 'Создайте свой первый пост!'}
            {tab === 'likes' && 'Начните лайкать интересные посты!'}
            {tab === 'comments' && 'Поделитесь своим мнением в комментариях!'}
          </p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard post={post} onDelete={handlePostDeleted} />
          </motion.div>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const profileAvatarUrl = getAvatarUrl(user.profile?.profilePictureUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200/30 via-base-100 to-base-200/30">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Профильная карточка */}
        <motion.div 
          className="bg-base-100 rounded-3xl shadow-xl overflow-hidden mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Фоновый градиент */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 relative">
            <div className="absolute inset-0 bg-black/5"></div>
          </div>
          
          {/* Информация профиля */}
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Аватар */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img
                  src={avatarError ? '/default-avatar.png' : profileAvatarUrl}
                  alt={user.fullName}
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-base-100 shadow-xl bg-base-200"
                  onError={() => setAvatarError(true)}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-3 border-base-100"></div>
              </motion.div>

              {/* Информация и кнопки */}
              <div className="flex-1 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-base-content mb-1">
                      {user.fullName}
                    </h1>
                    <p className="text-base-content/60 text-sm font-medium">
                      @{user.username}
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-sm sm:btn-md rounded-full px-6 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-base">✏️</span>
                    Редактировать
                  </motion.button>
                </div>

                {/* Био */}
                {user.profile?.bio && (
                  <p className="text-base-content mb-4 text-sm leading-relaxed">
                    {user.profile.bio}
                  </p>
                )}

                {/* Дополнительная информация */}
                <div className="flex flex-wrap gap-4 text-xs text-base-content/60">
                  {user.profile?.birthDate && (
                    <div className="flex items-center gap-2">
                      <span>🎂</span>
                      <span>{new Date(user.profile.birthDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Вкладки контента */}
        <motion.div 
          className="bg-base-100 rounded-3xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Навигация по вкладкам */}
          <div className="flex border-b border-base-200 bg-base-50">
            {tabs.map((tabItem) => (
              <motion.button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`flex-1 py-4 px-3 text-center font-medium transition-all duration-300 relative ${
                  tab === tabItem.key
                    ? 'text-primary'
                    : 'text-base-content/60 hover:text-primary/80'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{tabItem.icon}</span>
                  <span className="text-xs sm:text-sm">{tabItem.label}</span>
                  {items.length > 0 && tab === tabItem.key && (
                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  )}
                </div>
                {tab === tabItem.key && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Содержимое вкладок */}
          <div className="p-6">
            {renderTabContent()}
            
            {/* Загрузка и пагинация */}
            {isFetchingNextPage && (
              <div className="space-y-4 mt-6">
                {[...Array(2)].map((_, i) => (
                  <SkeletonPost key={i} />
                ))}
              </div>
            )}
            
            {hasNextPage && items.length > 0 && (
              <div className="text-center pt-8">
                <motion.button
                  onClick={fetchNextPage}
                  className="btn btn-outline btn-primary rounded-full px-8"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Загрузить еще
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Модальное окно редактирования */}
      {showModal && (
        <EditProfileModal
          onClose={() => setShowModal(false)}
          onSaved={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
