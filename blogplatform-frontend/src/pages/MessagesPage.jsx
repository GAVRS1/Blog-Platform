// src/pages/MessagesPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messagesService } from '@/services/messages';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await messagesService.getInbox();
        setItems(data);
      } catch (e) {
        toast.error(e.response?.data || 'Не удалось загрузить диалоги');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Сообщения</h1>
      </div>

      {loading && <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>}

      {!loading && (!items || items.length === 0) && (
        <div className="text-center py-10 opacity-60">
          Пока нет диалогов
        </div>
      )}

      {!loading && items?.length > 0 && (
        <div className="space-y-3">
          {items.map((x) => (
            <Link key={x.otherUserId} to={`/messages/${x.otherUserId}`} className="card bg-base-100 hover:bg-base-200 transition">
              <div className="card-body flex-row items-center gap-4">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-12">
                    <span>{x.otherUserId}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Пользователь #{x.otherUserId}</div>
                    {x.unreadCount > 0 && (
                      <div className="badge badge-primary">{x.unreadCount}</div>
                    )}
                  </div>
                  <div className="text-sm opacity-70 truncate">
                    {x.lastMessage?.content || '[вложение]'} · {new Date(x.lastMessage?.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}