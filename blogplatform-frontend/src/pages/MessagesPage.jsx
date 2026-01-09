// src/pages/MessagesPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { messagesService } from '@/services/messages';
import { usersService } from '@/services/users';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  subscribeToRealtimeMessages,
  subscribeToRealtimePresence,
  subscribeToRealtimeStatus
} from '@/realtimeEvents';

export default function MessagesPage() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState({});
  const [presenceByUser, setPresenceByUser] = useState({});
  const [realtimeStatus, setRealtimeStatus] = useState({ type: 'unknown' });
  const { user } = useAuth();
  const isRealtimeUnavailable = useMemo(() => (
    ['reconnecting', 'closed', 'error'].includes(realtimeStatus?.type)
  ), [realtimeStatus]);

  async function loadInbox() {
    try {
      const data = await messagesService.getInbox();
      setItems(data);
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить диалоги');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeMessages((incoming) => {
      if (!incoming) return;
      setItems((prev) => {
        if (!prev) {
          const isOwn = user?.id && incoming.senderId === user.id;
          const otherUserId = isOwn ? incoming.recipientId : incoming.senderId;
          return [{
            otherUserId,
            lastMessage: incoming,
            unreadCount: isOwn ? 0 : 1,
          }];
        }
        const isOwn = user?.id && incoming.senderId === user.id;
        const otherUserId = isOwn ? incoming.recipientId : incoming.senderId;
        const updated = {
          otherUserId,
          lastMessage: incoming,
          unreadCount: isOwn ? 0 : 1,
        };

        const existingIndex = prev.findIndex((item) => item.otherUserId === otherUserId);
        if (existingIndex === -1) {
          return [updated, ...prev];
        }

        const existing = prev[existingIndex];
        const merged = {
          ...existing,
          lastMessage: incoming,
          unreadCount: isOwn ? existing.unreadCount : (existing.unreadCount || 0) + 1,
        };

        const without = prev.filter((item) => item.otherUserId !== otherUserId);
        return [merged, ...without];
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimePresence((event) => {
      if (!event?.userId) return;
      setPresenceByUser((prev) => {
        const current = prev[event.userId] || {};
        if (event.type === 'online') {
          return {
            ...prev,
            [event.userId]: {
              ...current,
              status: 'online',
              lastSeenUtc: null,
              isTyping: false
            }
          };
        }
        if (event.type === 'offline') {
          return {
            ...prev,
            [event.userId]: {
              ...current,
              status: 'offline',
              lastSeenUtc: event.lastSeenUtc || current.lastSeenUtc || null,
              isTyping: false
            }
          };
        }
        if (event.type === 'typing') {
          return {
            ...prev,
            [event.userId]: {
              ...current,
              isTyping: Boolean(event.isTyping)
            }
          };
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeStatus((status) => {
      if (!status) return;
      setRealtimeStatus(status);
      if (status.type === 'reconnected' || status.type === 'connected') {
        loadInbox();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isRealtimeUnavailable) return undefined;
    const interval = setInterval(() => {
      loadInbox();
    }, 15000);
    return () => clearInterval(interval);
  }, [isRealtimeUnavailable]);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const missing = items
      .map((item) => item.otherUserId)
      .filter((id) => id && !profiles[id]);
    if (missing.length === 0) return;

    let isActive = true;
    Promise.all(missing.map((id) => usersService.getById(id).catch(() => null)))
      .then((responses) => {
        if (!isActive) return;
        setProfiles((prev) => {
          const updated = { ...prev };
          responses.forEach((res) => {
            if (!res?.id) return;
            updated[res.id] = res;
          });
          return updated;
        });
      });

    return () => {
      isActive = false;
    };
  }, [items, profiles]);

  const resolveDisplayName = (profile, userId) => {
    if (!profile) return `Пользователь #${userId}`;
    const fullName = profile.profile?.fullName?.trim();
    const username = profile.profile?.username?.trim() || profile.username?.trim();
    return fullName || username || `Пользователь #${userId}`;
  };

  const resolveAvatar = (profile) => {
    const avatar = profile?.profile?.profilePictureUrl?.trim();
    return avatar || null;
  };

  const resolveStatus = (presence) => {
    if (presence?.isTyping) return 'пишет...';
    if (presence?.status === 'online') return 'онлайн';
    if (presence?.lastSeenUtc) {
      return `был(а) в ${new Date(presence.lastSeenUtc).toLocaleString()}`;
    }
    return 'офлайн';
  };

  const formatMessageTimestamp = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const isSameDay = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isSameDay) return time;
    const shortDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    return `${shortDate} ${time}`;
  };

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
              <div className="card-body flex-row items-center gap-4 min-w-0">
                <div className="avatar">
                  <div className="rounded-full w-12">
                    {resolveAvatar(profiles[x.otherUserId]) ? (
                      <img src={resolveAvatar(profiles[x.otherUserId])} alt={resolveDisplayName(profiles[x.otherUserId], x.otherUserId)} />
                    ) : (
                      <div className="bg-neutral text-neutral-content rounded-full w-12 flex items-center justify-center">
                        <span>{resolveDisplayName(profiles[x.otherUserId], x.otherUserId).slice(0, 2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold truncate">{resolveDisplayName(profiles[x.otherUserId], x.otherUserId)}</div>
                    {x.unreadCount > 0 && (
                      <div className="badge badge-primary">{x.unreadCount}</div>
                    )}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {resolveStatus(presenceByUser[x.otherUserId])}
                  </div>
                  <div className="text-sm opacity-70 truncate">
                    {x.lastMessage?.content || '[вложение]'} · {formatMessageTimestamp(x.lastMessage?.createdAt)}
                    {x.lastMessage && (
                      <span className="ml-2 text-xs opacity-70">
                        {x.lastMessage.senderId === user?.id
                          ? (x.lastMessage.isRead ? '· прочитано' : '· не прочитано')
                          : (x.lastMessage.isRead ? '· прочитано' : '· не прочитано')}
                      </span>
                    )}
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
