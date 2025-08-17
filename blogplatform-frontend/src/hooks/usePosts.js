import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export default function usePosts(limit = 5) {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) =>
      api.get(`/posts?page=${pageParam}&limit=${limit}`).then((r) => r.data),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < limit ? undefined : allPages.length + 1,
  });
}