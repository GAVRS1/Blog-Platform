// src/pages/MyBlocksPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blocksService } from '@/services/blocks';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MyBlocksPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);

  async function load(page = 1) {
    setLoading(true);
    try {
      const res = await blocksService.list(page, 20);
      setData(res);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить список блокировок');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  const pages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || 20)));

  const unblock = async (userId) => {
    try {
      await blocksService.unblock(userId);
      toast.success('Пользователь разблокирован');
      await load(data.page);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось разблокировать');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Мои блокировки</h1>
        <button className="btn btn-sm" onClick={() => load(data.page)}>Обновить</button>
      </div>

      {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>}

      {!loading && data.items.length === 0 && (
        <div className="text-center py-10 opacity-60">Список пуст</div>
      )}

      {!loading && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map(u => (
            <div key={u.id} className="card bg-base-100">
              <div className="card-body flex-row items-center gap-4">
                <div className="avatar">
                  <div className="w-12 rounded-full ring ring-error ring-offset-base-100 ring-offset-2">
                    <img src={u.profile?.profilePictureUrl || '/avatar.png'} alt="" />
                  </div>
                </div>
                <div className="flex-1">
                  <Link to={`/users/${u.id}`} className="font-semibold hover:underline">@{u.username}</Link>
                  <div className="text-xs opacity-70">{u.profile?.fullName}</div>
                </div>
                <button className="btn btn-sm btn-warning" onClick={() => unblock(u.id)}>Разблокировать</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="join mt-6">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} className={`join-item btn btn-sm ${data.page === i + 1 ? 'btn-primary' : ''}`} onClick={() => load(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}