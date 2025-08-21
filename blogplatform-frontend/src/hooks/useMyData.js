// src/hooks/useMyData.js
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export function useMyData(endpoint) {
  return useInfiniteQuery({
    queryKey: ['my-data', endpoint],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(
        `/${endpoint}?page=${pageParam}&limit=5`
      );
      // Обрабатываем разные структуры ответов
      return response.data.posts || 
             response.data.comments || 
             response.data.likes || 
             response.data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 5 ? undefined : allPages.length + 1,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
}