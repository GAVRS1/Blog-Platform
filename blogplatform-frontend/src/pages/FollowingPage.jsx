// src/pages/FollowingPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { followsService } from '@/services/follows';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import FollowButton from '@/components/FollowButton';
import { getAvatarUrl } from '@/utils/avatar';

export default function FollowingPage() {
  const { id } = useParams();
  const userId = Number(id);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);

  async function load(p = 1) {
    setLoading(true);
    try {
      const res = await followsService.following(userId, p, 20);
      setData(res);
      setPage(p);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить подписки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, [userId]);

  const pages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || 20)));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Подписки #{userId}</h1>
      </div>

      {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>}

      {!loading && data.items.length === 0 && (
        <div className="text-center opacity-60 py-10">Список подписок пуст</div>
      )}

      {!loading && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map(u => (
            <div key={u.id} className="card bg-base-100">
              <div className="card-body flex-row items-center gap-4">
                <div className="avatar">
                  <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={getAvatarUrl(u.profile?.profilePictureUrl)} alt="" />
                  </div>
                </div>
                <div className="flex-1">
                  <Link to={`/users/${u.id}`} className="font-semibold hover:underline">
                    {u.profile?.fullName || u.username}
                  </Link>
                  <div className="text-xs opacity-70">@{u.username}</div>
                </div>
                <FollowButton userId={u.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="join mt-6">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} className={`join-item btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => load(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
