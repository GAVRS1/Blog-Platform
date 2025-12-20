// src/pages/MyItemsPage.jsx
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useMyData } from '@/hooks/useMyData';
import PostCard from '@/components/PostCard';
import SkeletonPost from '@/components/SkeletonPost';

export default function MyItemsPage({ title, endpoint }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyData(endpoint);

  const { ref, inView } = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = data?.pages.flat() ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>

      <div className="space-y-6">
        {items.map(p => <PostCard key={p.id} post={p} />)}
        {isFetchingNextPage && [...Array(3)].map((_, i) => <SkeletonPost key={i} />)}
        {!isFetchingNextPage && !hasNextPage && items.length === 0 && (
          <p className="text-center text-base-content/60">Пока пусто 😴</p>
        )}
        <div ref={ref} className="h-1" />
      </div>
    </div>
  );
}