import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export function useMyData(endpoint, limit = 10) {
  return useInfiniteQuery({
    queryKey: [endpoint],
    queryFn: ({ pageParam = 1 }) =>
      api.get(`/${endpoint}?page=${pageParam}&limit=${limit}`).then(r => r.data),
    getNextPageParam: (last, pages) =>
      last.length < limit ? undefined : pages.length + 1,
  });
}