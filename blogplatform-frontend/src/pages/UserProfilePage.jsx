// src/pages/UserProfilePage.jsx (обновленная версия)
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Добавлен useQueryClient
import { getAvatarUrl } from '@/utils/avatar';
import PostCard from '@/components/PostCard'; // Убедиться, что PostCard импортирован
import SkeletonPost from '@/components/SkeletonPost';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { userId } = useParams();
  const queryClient = useQueryClient(); // Получаем queryClient
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
    const loadUserProfile = async () => {
      try {
        const response = await api.get(`/users/${userId}/profile`);
        setUserProfile(response.data);
        setAvatarError(false);
      } catch (error) {
        toast.error('Не удалось загрузить профиль пользователя');
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch // Получаем функцию refetch для обновления данных
  } = useInfiniteQuery({
    queryKey: ['user-posts', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/posts/user/${userId}?page=${pageParam}&limit=5`);
      return response.data.posts || response.data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 5 ? undefined : allPages.length + 1,
    enabled: !!userId && !loading,
  });

  const posts = postsData?.pages.flat() ?? [];

  // --- Добавлено: Функция для обработки удаления поста ---
  const handlePostDeleted = (postId) => {
    // Перезагружаем данные постов пользователя
    refetch();
    // Альтернативно, можно обновить кэш вручную аналогично ProfilePage
  };
  // --- Конец добавления ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-base-content">Пользователь не найден</h2>
      </div>
    );
  }

  const profileAvatarUrl = avatarError
    ? '/avatar.png'
    : getAvatarUrl(userProfile.profile?.profilePictureUrl);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-base-100 rounded-lg shadow-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <img
            src={profileAvatarUrl}
            alt={userProfile.fullName}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 aspect-square"
            onError={() => {
              console.error(`Ошибка загрузки аватара: ${profileAvatarUrl}`);
              setAvatarError(true);
            }}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-base-content mb-2">{userProfile.fullName}</h1>
            <p className="text-base-content/80 mb-4">@{userProfile.username}</p>
            {userProfile.profile?.bio && (
              <p className="text-base-content mb-4">{userProfile.profile.bio}</p>
            )}
            <div className="flex gap-6 text-sm text-base-content/70">
              <span>
                <i className="fas fa-file-alt mr-1"></i>
                {userProfile.stats?.postsCount || 0} постов
              </span>
              <span>
                <i className="fas fa-heart mr-1"></i>
                {userProfile.stats?.likesCount || 0} лайков
              </span>
              <span>
                <i className="fas fa-comments mr-1"></i>
                {userProfile.stats?.commentsCount || 0} комментариев
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-base-100 rounded-lg shadow-xl p-6">
        <h3 className="text-2xl font-bold text-base-content mb-6">
          Публикации пользователя
        </h3>
        {posts.length === 0 && !isFetchingNextPage ? (
          <div className="text-center py-12">
            <i className="fas fa-file-alt text-6xl text-base-content/30 mb-4"></i>
            <h4 className="text-xl font-semibold text-base-content/70 mb-2">
              Пока нет публикаций
            </h4>
            <p className="text-base-content/60">
              Пользователь еще не создал ни одного поста
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* --- Изменено: Передаем onDelete в PostCard --- */}
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={handlePostDeleted} 
              />
            ))}
            {/* --- Конец изменений --- */}
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
  );
}