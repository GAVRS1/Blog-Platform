// src/hooks/usePosts.js
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function usePosts(limit = 5) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const res = await api.get(`/posts?page=${page}&limit=${limit}`);
    const newPosts = res.data;
    if (newPosts.length < limit) setHasMore(false);
    setPosts(prev => [...prev, ...newPosts]);
    setPage(prev => prev + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadMore(); // первый заход
  }, []); // eslint-disable-line

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadMore();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, hasMore]);

  return { posts, loading, hasMore };
}