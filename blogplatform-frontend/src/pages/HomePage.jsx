// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import SkeletonPost from '@/components/SkeletonPost';
import api from '@/api/axios';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const { isLoggedIn } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) =>
      api.get(`/posts?page=${pageParam}&limit=5`).then(r => r.data),
    getNextPageParam: (last, pages) =>
      last.length < 5 ? undefined : pages.length + 1,
  });

  const { ref, inView } = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView]);

  const posts = data?.pages.flat() ?? [];

  /* 1. Неавторизованный пользователь */
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-base-content mb-4">
          Посты доступны после входа
        </h2>
        <Link
          to="/login"
          className="btn btn-primary"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  /* 2. Авторизованный пользователь — обычная лента */
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
        {posts.map(p => <PostCard key={p.id} post={p} />)}
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