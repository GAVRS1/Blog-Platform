// src/pages/MyBlocksPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blocksService } from '@/services/blocks';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';

export default function MyBlocksPage() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await blocksService.list();
      setBlocks(res || []);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить список блокировок');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const unblock = async (userId) => {
    try {
      await blocksService.unblock(userId);
      toast.success('Пользователь разблокирован');
      await load();
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось разблокировать');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Мои блокировки</h1>
        <button className="btn btn-sm" onClick={() => load()}>Обновить</button>
      </div>

      {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>}

      {!loading && blocks.length === 0 && (
        <div className="text-center py-10 opacity-60">Список пуст</div>
      )}

      {!loading && blocks.length > 0 && (
        <div className="space-y-3">
          {blocks.map(u => (
            <div key={u.id} className="card bg-base-100">
              <div className="card-body flex-row items-center gap-4">
                <div className="avatar">
                  <div className="w-12 rounded-full ring ring-error ring-offset-base-100 ring-offset-2">
                    <img src={getAvatarUrl(u.profile?.profilePictureUrl)} alt="" />
                  </div>
                </div>
                <div className="flex-1">
                  <Link to={`/users/${u.id}`} className="font-semibold hover:underline">
                    {u.profile?.fullName || u.username}
                  </Link>
                  <div className="text-xs opacity-70">@{u.username}</div>
                </div>
                <button className="btn btn-sm btn-warning" onClick={() => unblock(u.id)}>Разблокировать</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
