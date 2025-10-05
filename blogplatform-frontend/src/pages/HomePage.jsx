// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import PostCard from '@/components/PostCard';
import SkeletonPost from '@/components/SkeletonPost';
import { postsService } from '@/services/posts';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function HomePage() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const [refreshTick, setRefreshTick] = useState(0);

  // Глобальный рефреш, когда кто-то создал пост из модалки
  useEffect(() => {
    const handler = () => setRefreshTick((t) => t + 1);
    window.addEventListener('post-created', handler);
    return () => window.removeEventListener('post-created', handler);
  }, []);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error
  } = useInfiniteQuery({
    queryKey: ['feed', refreshTick],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await postsService.list({ page: pageParam, pageSize: PAGE_SIZE });
      // ожидаем { items,total,page,pageSize }
      return res.items || [];
    },
    getNextPageParam: (lastPage, allPages) =>
      (lastPage?.length || 0) < PAGE_SIZE ? undefined : allPages.length + 1,
    staleTime: 60_000,
  });

  // Догрузка, когда появляемся внизу
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(() => {});
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (error) toast.error('Не удалось загрузить ленту');
  }, [error]);

  const flat = data?.pages ? data.pages.flat() : [];

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonPost key={i} />)}
        </div>
      )}

      {!isLoading && flat.length === 0 && (
        <div className="min-h-[40vh] grid place-items-center text-center opacity-70">
          <div>
            <div className="text-4xl mb-2">🗞️</div>
            <div>Лента пуста. Подпишитесь на кого-нибудь или создайте пост.</div>
          </div>
        </div>
      )}

      {flat.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onDeleted={() => {
            // Если реализуешь удаление — просто перезагрузим
            refetch();
          }}
        />
      ))}

      {/* Триггер догрузки */}
      <div ref={ref} className="h-12 flex items-center justify-center">
        {isFetchingNextPage && <span className="loading loading-spinner text-primary" />}
      </div>
    </div>
  );
}