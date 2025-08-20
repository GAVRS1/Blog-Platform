// src/pages/UserProfilePage.jsx - НОВЫЙ ФАЙЛ
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getAvatarUrl } from '@/utils/avatar';
import PostCard from '@/components/PostCard';
import SkeletonPost from '@/components/SkeletonPost';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем профиль пользователя
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await api.get(`/users/${userId}/profile`);
        setUserProfile(response.data);
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

  // Загружаем посты пользователя
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['user-posts', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/posts/user/${userId}?page=${pageParam}&limit=5`);
      return response.data.posts || response.data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 5 ? undefined : allPages.length + 1,
    enabled: !!userId,
  });

  const posts = postsData?.pages.flat() ?? [];

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
        <h2 className="text-2xl font-bold text-gray-700">Пользователь не найден</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      /* Профиль пользователя */
      <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <img
            src={getAvatarUrl(userProfile.profile?.profilePictureUrl)}
            alt={userProfile.fullName}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
          />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{userProfile.fullName}</h1>
            <p className="text-gray-600 mb-4">@{userProfile.username}</p>
            
            {userProfile.profile?.bio && (
              <p className="text-gray-700 mb-4">{userProfile.profile.bio}</p>
            )}
            
            /* Статистика */
            <div className="flex gap-6 text-sm text-gray-600">
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

      /* Посты пользователя */
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Публикации пользователя
        </h3>

        {posts.length === 0 && !isFetchingNextPage ? (
          <div className="text-center py-12">
            <i className="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
            <h4 className="text-xl font-semibold text-gray-500 mb-2">
              Пока нет публикаций
            </h4>
            <p className="text-gray-400">
              Пользователь еще не создал ни одного поста
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
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
