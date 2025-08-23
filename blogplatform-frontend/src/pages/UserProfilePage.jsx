// src/pages/UserProfilePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getAvatarUrl } from '@/utils/avatar';
import SkeletonPost from '@/components/SkeletonPost';
import PostCard from '@/components/PostCard';
import api from '@/api/axios';
import toast from 'react-hot-toast';

// Определяем вкладки. Для чужого профиля убираем вкладки 'likes' и 'comments',
// если они не реализованы на бэкенде для просмотра другими пользователями.
// Оставляем только 'posts'. Если они доступны, можно их вернуть.
const tabs = [
  { key: 'posts', label: 'Публикации', icon: 'fas fa-file-alt' },
  // Если API поддерживает просмотр лайков/комментариев другими пользователями, раскомментируйте:
  // { key: 'likes', label: 'Лайки', icon: 'fas fa-heart' },
  // { key: 'comments', label: 'Комментарии', icon: 'fas fa-comments' },
];

export default function UserProfilePage() {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [tab, setTab] = useState('posts'); // По умолчанию активна вкладка 'posts'
  const [loading, setLoading] = useState(true);

  // Загрузка данных пользователя
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await api.get(`/users/${userId}/profile`);
        setUserProfile(response.data);
        setAvatarError(false);
      } catch (error) {
        toast.error('Не удалось загрузить профиль пользователя');
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  // Загрузка постов пользователя с помощью useInfiniteQuery
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch // Для обновления данных при необходимости
  } = useInfiniteQuery({
    queryKey: ['user-posts', userId, tab], // Добавляем 'tab' в ключ, если будут другие вкладки
    queryFn: async ({ pageParam = 1 }) => {
      // Для вкладки 'posts' загружаем посты пользователя
      if (tab === 'posts') {
        const response = await api.get(`/posts/user/${userId}?page=${pageParam}&limit=5`);
        return response.data.posts || response.data;
      }
      // Если будут другие вкладки (likes, comments), добавить логику здесь
      // Например:
      // if (tab === 'likes') {
      //   const response = await api.get(`/Users/${userId}/liked-posts?page=${pageParam}&limit=5`);
      //   return response.data.posts || response.data;
      // }
      // Возвращаем пустой массив по умолчанию
      return [];
    },
    getNextPageParam: (lastPage, allPages) => {
      // Предполагаем, что API возвращает { posts: [...], totalPages: N, currentPage: N }
      // или просто массив постов и информацию о страницах в заголовках
      // Этот пример предполагает наличие `hasNextPage` или подобной логики
      // Вам нужно адаптировать это под ваш API
      if (lastPage && lastPage.length === 5) { // Если вернулось 5 постов, предполагаем, что могут быть еще
         return allPages.length + 1;
      }
      return undefined; // Больше страниц нет
    },
    enabled: !!userId && !!userProfile, // Запускаем только если есть userId и данные профиля загружены
  });

  const items = data?.pages.flat() ?? [];

  // Обработчик удаления поста (если пользователь удаляет свой пост из этого списка)
  // В данном случае, для чужого профиля, onDelete в PostCard будет null или не передан,
  // так как пользователь не может удалять чужие посты напрямую отсюда.
  // Но если это его собственный профиль (проверка внутри PostCard), onDelete может быть нужен.
  // Для простоты, не передаем onDelete для чужих профилей.
  // const handlePostDeleted = (postId) => {
  //   refetch(); // Или обновить локальное состояние items
  // };

  const renderTabContent = () => {
    if (tab === 'posts') {
      return items.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          // onDelete={null} // Не передаем onDelete для чужих постов
        />
      ));
    }
    // Добавить рендер для 'likes' и 'comments' если они будут
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 text-center max-w-4xl">
        <h2 className="text-xl sm:text-2xl font-bold text-base-content">Пользователь не найден</h2>
      </div>
    );
  }

  // Приоритетное отображение fullName, fallback на username
  const displayName = userProfile.profile?.fullName || userProfile.fullName || userProfile.username || 'Имя не указано';
  const profileAvatarUrl = avatarError ? '/avatar.png' : getAvatarUrl(userProfile.profile?.profilePictureUrl);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* Профильная карточка с улучшенной симметрией */}
      <div className="bg-base-100/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-base-300/30 p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
          {/* Аватар */}
          <div className="relative">
            <img
              src={profileAvatarUrl}
              alt={displayName}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg aspect-square"
              onError={() => {
                console.error(`Ошибка загрузки аватара: ${profileAvatarUrl}`);
                setAvatarError(true);
              }}
            />
            {/* Фиолетовый кружок онлайна удален, как в собственном профиле */}
          </div>
          
          {/* Информация о пользователе */}
          <div className="space-y-2 sm:space-y-3 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">{displayName}</h1>
            <p className="text-base sm:text-lg text-base-content/70">@{userProfile.username || 'username'}</p>
            {userProfile.profile?.bio && (
              <p className="text-sm sm:text-base text-base-content/80 leading-relaxed px-4">
                {userProfile.profile.bio}
              </p>
            )}
            
            {/* Дата рождения */}
            <div className="flex justify-center items-center gap-2 text-xs sm:text-sm text-base-content/60">
              <i className="fas fa-calendar"></i>
              <span>
                {userProfile.profile?.birthDate ? 
                  `Дата рождения: ${new Date(userProfile.profile.birthDate).toLocaleDateString('ru-RU')}` : 
                  'Дата рождения не указана'
                }
              </span>
            </div>

            {/* Статистика пользователя (если доступна) */}
            <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm pt-2">
              <span className="flex items-center gap-1">
                <i className="fas fa-file-alt"></i>
                <span>{userProfile.stats?.postsCount ?? 0} постов</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-heart"></i>
                <span>{userProfile.stats?.likesCount ?? 0} лайков</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-comments"></i>
                <span>{userProfile.stats?.commentsCount ?? 0} комментариев</span>
              </span>
            </div>
          </div>
          
          {/* Кнопка "Редактировать профиль" отсутствует для чужого профиля */}
        </div>
      </div>

      {/* Вкладки (если больше одной) */}
      {tabs.length > 1 ? (
        <div className="bg-base-100/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-base-300/30 overflow-hidden mb-6 sm:mb-8">
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
        </div>
      ) : null}

      {/* Контент вкладок */}
      <div className="bg-base-100/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-base-300/30 overflow-hidden">
        <div className="p-4 sm:p-6">
          {items.length === 0 && !isFetchingNextPage ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-base-200 flex items-center justify-center">
                <i className={`${tabs.find(t => t.key === tab)?.icon || 'fas fa-file-alt'} text-2xl sm:text-3xl text-base-content/30`}></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-base-content/70 mb-2">
                {tab === 'posts' && 'Пока нет публикаций'}
                {/* Добавить сообщения для других вкладок при необходимости */}
              </h3>
              <p className="text-sm sm:text-base text-base-content/50 max-w-sm mx-auto">
                {tab === 'posts' && 'Пользователь еще не создал ни одного поста'}
                {/* Добавить сообщения для других вкладок при необходимости */}
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
    </div>
  );
}