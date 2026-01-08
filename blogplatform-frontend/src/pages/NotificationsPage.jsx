// src/pages/NotificationsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '@/services/notifications';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const formatTimestamp = (value) => new Date(value).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const getNotificationRoute = (notification) => {
    if (notification.postId) {
      return `/posts/${notification.postId}`;
    }

    if (notification.userId) {
      return `/users/${notification.userId}`;
    }

    if (notification.type === 'message' && notification.subjectId) {
      return `/messages/${notification.subjectId}`;
    }

    if (notification.subjectType === 'post' && notification.subjectId) {
      return `/posts/${notification.subjectId}`;
    }

    if (notification.subjectType === 'user' && notification.subjectId) {
      return `/users/${notification.subjectId}`;
    }

    return null;
  };

  const handleNotificationClick = async (notification) => {
    const target = getNotificationRoute(notification);

    try {
      await notificationsService.markRead(notification.id);
      setItems(prev => prev?.map(item => (
        item.id === notification.id ? { ...item, isRead: true } : item
      )));
    } catch {
      toast.error('Не удалось отметить уведомление прочитанным');
    }

    if (target) {
      navigate(target);
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
              <button
                type="button"
                className="flex items-center gap-2 w-full text-left"
                onClick={() => handleNotificationClick(n)}
              >
                <span className="badge">{n.type}</span>
                {n.text || 'Уведомление'} · <span className="opacity-60">{formatTimestamp(n.createdAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
