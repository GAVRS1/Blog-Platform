// src/hooks/useMyData.js
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Добавлен useQueryClient
import api from '@/api/axios';

export function useMyData(endpoint) {
  // Получаем queryClient для возможности инвалидации
  const queryClient = useQueryClient();

  const queryInfo = useInfiniteQuery({
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

  // Возвращаем queryInfo и функцию для принудительной инвалидации
  return {
    ...queryInfo,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['my-data', endpoint] })
  };
}