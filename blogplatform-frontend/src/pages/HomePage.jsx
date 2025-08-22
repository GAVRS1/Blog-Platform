// src/pages/HomePage.jsx (обновленная версия)
import { useState, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Добавлен useQueryClient
import { useInView } from 'react-intersection-observer';
import PostCard from '@/components/PostCard'; // Убедиться, что PostCard импортирован
import CreatePostModal from '@/components/CreatePostModal';
import SkeletonPost from '@/components/SkeletonPost';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function HomePage() {
  const queryClient = useQueryClient(); // Получаем queryClient
  const [showModal, setShowModal] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts'], // Используем общий ключ для ленты
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/posts/feed?page=${pageParam}&limit=5`);
      return response.data.posts || response.data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 5 ? undefined : allPages.length + 1,
    staleTime: 1000 * 60 * 5,
  });

  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (error) {
      toast.error('Ошибка загрузки постов');
    }
  }, [error]);

  const posts = data?.pages.flat() ?? [];

  const handlePostCreated = () => {
    refetch();
    setShowModal(false);
    toast.success('Пост успешно создан!');
  };

  // --- Добавлено: Функция для обработки удаления поста в ленте ---
  const handlePostDeleted = (postId) => {
    // Инвалидируем кэш ленты постов
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    // Альтернативно, можно обновить кэш вручную
  };
  // --- Конец добавления ---

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">
          <i className="fas fa-stream mr-3"></i>
          Лента постов
        </h1>
      </div>
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
        {hasNextPage && <div ref={ref} className="h-10" />}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Вы просмотрели все посты!</p>
          </div>
        )}
        {posts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              Пока нет постов
            </h3>
            <p className="text-gray-400 mb-4">
              Будьте первым, кто опубликует что-то интересное!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              Создать первый пост
            </button>
          </div>
        )}
      </div>
      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}