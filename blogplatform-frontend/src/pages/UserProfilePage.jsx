import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getAvatarUrl } from '@/utils/avatar';
import PostCard from '@/components/PostCard';
import SkeletonPost from '@/components/SkeletonPost';
import { motion } from 'framer-motion';
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
    queryKey: ['userPosts', userId],
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
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-base-content mb-2">Пользователь не найден</h2>
        <p className="text-base-content/60">Возможно, профиль был удален или не существует</p>
      </div>
    );
  }

  return (
    // Обертка для обеспечения правильного отображения с боковой панелью
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div 
          className="card bg-base-100/80 backdrop-blur-sm shadow-xl p-8 mb-8 border border-base-300/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <img
              src={getAvatarUrl(userProfile.profilePictureUrl)}
              alt={userProfile.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-base-content mb-2">{userProfile.fullName}</h1>
              <p className="text-base-content/80 mb-2">@{userProfile.username}</p>
              
              {userProfile.bio && (
                <p className="text-base-content mb-4">{userProfile.bio}</p>
              )}
              
              <div className="flex gap-6 text-sm text-base-content/60">
                <span>
                  <i className="fas fa-calendar mr-1"></i>
                  Дата рождения: {userProfile.birthDate ? 
                    new Date(userProfile.birthDate).toLocaleDateString('ru-RU') : 
                    'Не указана'}
                </span>
                <span>
                  <i className="fas fa-file-alt mr-1"></i>
                  Постов: {posts.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header p-6 border-b border-base-300">
            <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
              <i className="fas fa-file-alt text-primary"></i>
              Публикации пользователя
            </h2>
          </div>

          <div className="card-body p-6">
            {posts.length === 0 && !isFetchingNextPage ? (
              <div className="text-center py-12">
                <i className="fas fa-file-alt text-6xl text-base-content/30 mb-4"></i>
                <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                  Пока нет публикаций
                </h3>
                <p className="text-base-content/50">
                  У пользователя пока нет опубликованных постов
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
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
        </motion.div>
      </div>
    </div>
  );
}