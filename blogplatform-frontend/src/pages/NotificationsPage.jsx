// src/pages/NotificationsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '@/services/notifications';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { subscribeToRealtimeNotifications, subscribeToRealtimeStatus } from '@/realtimeEvents';

const notificationTypeLabels = {
  Like: 'Лайк',
  Comment: 'Комментарий',
  Follow: 'Подписка'
};

const notificationTypeMessages = {
  Like: 'Поставили лайк',
  Comment: 'Оставили комментарий',
  Follow: 'Подписались на вас'
};

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

export default function NotificationsPage() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState({ type: 'unknown' });
  const navigate = useNavigate();
  const isRealtimeUnavailable = useMemo(() => (
    ['reconnecting', 'closed', 'error'].includes(realtimeStatus?.type)
  ), [realtimeStatus]);

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

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeNotifications((incoming) => {
      if (!incoming) return;
      setItems((prev) => {
        if (!prev || prev.length === 0) {
          return [incoming];
        }
        const index = prev.findIndex((item) => item.id === incoming.id);
        if (index === -1) {
          return [incoming, ...prev];
        }
        const updated = [...prev];
        updated[index] = { ...updated[index], ...incoming };
        return updated;
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeStatus((status) => {
      if (!status) return;
      setRealtimeStatus(status);
      if (status.type === 'reconnected' || status.type === 'connected') {
        load();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isRealtimeUnavailable) return undefined;
    const interval = setInterval(() => {
      load();
    }, 15000);
    return () => clearInterval(interval);
  }, [isRealtimeUnavailable]);

  const markAll = async () => {
    try {
      await notificationsService.markAllRead();
      toast.success('Все уведомления отмечены прочитанными');
      await load();
    } catch {
      toast.error('Не удалось пометить прочитанными');
    }
  };

  const clearAll = async () => {
    try {
      await notificationsService.deleteAll();
      setItems([]);
      toast.success('Все уведомления удалены');
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось удалить уведомления');
    }
  };

  const deleteOne = async (event, notificationId) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await notificationsService.delete(notificationId);
      setItems((prev) => prev?.filter((item) => item.id !== notificationId));
      toast.success('Уведомление удалено');
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось удалить уведомление');
    }
  };

  const formatTimestamp = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return timeFormatter.format(date);
  };

  const getNotificationTypeLabel = (type) => (
    notificationTypeLabels[type] || 'Уведомление'
  );

  const getNotificationMessage = (notification) => {
    const baseMessage = notificationTypeMessages[notification?.type] || 'Новое уведомление';
    const senderName = notification?.senderDisplayName?.trim();
    if (senderName) {
      return `${senderName}: ${baseMessage}`;
    }

    return notification?.text || baseMessage;
  };

  const getNotificationRoute = (notification) => {
    if (notification.postId) {
      return `/posts/${notification.postId}`;
    }

    if (notification.subjectType && notification.subjectId) {
      if (notification.subjectType === 'post') {
        return `/posts/${notification.subjectId}`;
      }
      if (notification.subjectType === 'comment') {
        if (notification.postId) {
          return `/posts/${notification.postId}`;
        }
      }
      if (notification.subjectType === 'user') {
        return `/users/${notification.subjectId}`;
      }
    }

    if (notification.userId) {
      return `/users/${notification.userId}`;
    }
    if (notification.messageId) {
      return `/messages/${notification.messageId}`;
    }

    return null;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) {
      return;
    }

    const route = getNotificationRoute(notification);

    if (!notification.isRead) {
      try {
        await notificationsService.markRead(notification.id);
        setItems((prev) => prev?.map((item) => (
          item.id === notification.id ? { ...item, isRead: true } : item
        )));
      } catch (e) {
        toast.error(e.response?.data || 'Не удалось отметить уведомление');
      }
    }

    if (route) {
      navigate(route);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 min-w-0">
        <h1 className="text-2xl font-bold min-w-0">Уведомления</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
          <button className="btn btn-ghost btn-sm" onClick={markAll}>Отметить все прочитанными</button>
          <button className="btn btn-ghost btn-sm text-error" onClick={clearAll}>Очистить все</button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>}

      {!loading && (!items || items.length === 0) && (
        <div className="text-center py-10 opacity-60">Нет уведомлений</div>
      )}

      {!loading && items?.length > 0 && (
        <ul className="menu bg-base-100 rounded-box">
          {items.map(n => (
            <li key={n.id} className={n.isRead ? '' : 'font-semibold'}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left break-words whitespace-normal"
                  onClick={() => handleNotificationClick(n)}
                >
                  <span className="badge mr-2">{getNotificationTypeLabel(n.type)}</span>
                  {getNotificationMessage(n)} · <span className="opacity-60">{formatTimestamp(n.createdAt)}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={(event) => deleteOne(event, n.id)}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
