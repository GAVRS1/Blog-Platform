import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/likes/post/${postId}`),
    onSuccess: (res) => {
      setLiked(res.data.liked);
      setCount(res.data.liked ? count + 1 : count - 1);
      // инвалидируем всё, где используются посты
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['post', postId]);
    },
  });

  return (
    <button
      className={`btn btn-ghost btn-sm gap-1 ${liked ? 'text-red-500' : ''}`}
      onClick={() => likeMutation.mutate()}
      disabled={likeMutation.isPending}
    >
      {liked ? '❤️' : '🤍'} {count}
    </button>
  );
}