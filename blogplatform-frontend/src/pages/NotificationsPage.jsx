// src/pages/NotificationsPage.jsx
import { useEffect, useState } from 'react';
import { notificationsService } from '@/services/notifications';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await notificationsService.list(1, 50);
      setItems(data);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить уведомления');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    try {
      await notificationsService.markAllRead();
      toast.success('Все уведомления отмечены прочитанными');
      await load();
    } catch {
      toast.error('Не удалось пометить прочитанными');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <button className="btn btn-ghost btn-sm" onClick={markAll}>Отметить все прочитанными</button>
      </div>

      {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>}

      {!loading && (!items || items.length === 0) && (
        <div className="text-center py-10 opacity-60">Нет уведомлений</div>
      )}

      {!loading && items?.length > 0 && (
        <ul className="menu bg-base-100 rounded-box">
          {items.map(n => (
            <li key={n.id} className={n.isRead ? '' : 'font-semibold'}>
              <span>
                <span className="badge mr-2">{n.type}</span>
                {n.text || 'Уведомление'} · <span className="opacity-60">{new Date(n.createdAt).toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}