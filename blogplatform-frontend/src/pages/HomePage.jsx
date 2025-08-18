import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import SkeletonPost from '@/components/SkeletonPost';
import api from '@/api/axios';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(['posts'], ({ pageParam = 1 }) =>
    api.get(`/posts?page=${pageParam}&limit=5`).then((r) => r.data),
    {
      getNextPageParam: (last, pages) =>
        last.length < 5 ? undefined : pages.length + 1,
    }
  );

  const { ref, inView } = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  const posts = data?.pages.flat() ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Лента</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Новый пост
        </button>
      </header>

      <div className="space-y-6">
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
        {isFetchingNextPage && [...Array(3)].map((_, i) => <SkeletonPost key={i} />)}
        {!isFetchingNextPage && !hasNextPage && posts.length === 0 && (
          <p className="text-center text-base-content/60">Пока ничего нет 😴</p>
        )}
        <div ref={ref} className="h-1" />
      </div>

      {showModal && (
        <CreatePostModal onClose={() => setShowModal(false)} onCreated={() => refetch()} />
      )}
    </div>
  );
}