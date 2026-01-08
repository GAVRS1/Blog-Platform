// src/pages/DialogPage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { messagesService } from '@/services/messages';
import { mediaService } from '@/services/media';
import { usersService } from '@/services/users';
import { blocksService } from '@/services/blocks';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToRealtimeMessages, subscribeToRealtimePresence, subscribeToRealtimeStatus } from '@/realtimeEvents';
import { sendTyping } from '@/realtime';
import ReportModal from '@/components/ReportModal';

const MAX_ATTACH = 10;

export default function DialogPage() {
  const { id } = useParams();
  const otherUserId = Number(id);
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploads, setUploads] = useState([]); // [{ url, mediaType, mimeType, sizeBytes, thumbnailUrl }]
  const [profile, setProfile] = useState(null);
  const [presence, setPresence] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingStateRef = useRef(false);

  useEffect(() => {
    loadPage(1, true);
    markReadAndSync();
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId]);

  useEffect(() => {
    const unsubscribeMessages = subscribeToRealtimeMessages((incoming) => {
      if (!incoming) return;
      const isOwn = user?.id && incoming.senderId === user.id;
      const matchesDialog = incoming.senderId === otherUserId || incoming.recipientId === otherUserId;
      if (!matchesDialog) return;

      setList((prev) => {
        if (!prev || prev.length === 0) {
          return [incoming];
        }
        if (prev.some((item) => item.id === incoming.id)) {
          return prev;
        }
        return [...prev, incoming];
      });

      setTimeout(() => {
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);

      if (!isOwn && incoming.senderId === otherUserId) {
        markReadAndSync();
      }
    });

    const unsubscribeStatus = subscribeToRealtimeStatus((status) => {
      if (status?.type === 'reconnected') {
        loadPage(1, true);
        markReadAndSync();
      }
    });

    const unsubscribePresence = subscribeToRealtimePresence((event) => {
      if (event?.userId !== otherUserId) return;
      if (event.type === 'online') {
        setPresence({ status: 'online', lastSeenUtc: null, isTyping: false });
        return;
      }
      if (event.type === 'offline') {
        setPresence((prev) => ({
          status: 'offline',
          lastSeenUtc: event.lastSeenUtc || prev?.lastSeenUtc || null,
          isTyping: false
        }));
        return;
      }
      if (event.type === 'typing') {
        setPresence((prev) => ({
          ...(prev || {}),
          isTyping: Boolean(event.isTyping)
        }));
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
      unsubscribePresence();
    };
  }, [otherUserId, user?.id]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingStateRef.current) {
        sendTyping(otherUserId, false);
        typingStateRef.current = false;
      }
    };
  }, [otherUserId]);

  async function loadPage(p, replace = false) {
    try {
      const data = await messagesService.getDialog(otherUserId, p, 30);
      if (replace) {
        setList(data);
      } else {
        setList((prev) => [...(prev || []), ...data]);
      }
      setHasMore(data.length === 30);
      setPage(p);
      if (p === 1) {
        setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight }), 0);
      }
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось загрузить сообщения');
    }
  }

  async function markReadAndSync() {
    try {
      const result = await messagesService.markRead(otherUserId);
      if (!result?.updatedMessages?.length) return;
      setList((prev) => {
        if (!prev) return prev;
        const updates = new Map(result.updatedMessages.map((item) => [item.id, item]));
        return prev.map((item) => {
          const update = updates.get(item.id);
          if (!update) return item;
          return { ...item, isRead: update.isRead, readAt: update.readAt };
        });
      });
    } catch {
      // ignore
    }
  }

  async function loadProfile() {
    try {
      const data = await usersService.getById(otherUserId);
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }

  function mimeToType(file) {
    const t = (file.type || '').toLowerCase();
    if (t.startsWith('image/')) return 'image';
    if (t.startsWith('video/')) return 'video';
    if (t.startsWith('audio/')) return 'audio';
    return 'other';
  }

  async function onFilesPicked(e) {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;
    if ((uploads.length + list.length) > MAX_ATTACH) {
      toast.error(`Максимум ${MAX_ATTACH} вложений`);
      const allowed = MAX_ATTACH - uploads.length;
      if (allowed <= 0) { e.target.value = ''; return; }
      await uploadFiles(list.slice(0, allowed));
    } else {
      await uploadFiles(list);
    }
    e.target.value = '';
  }

  async function uploadFiles(files) {
    const typeHints = files.map(mimeToType);
    try {
      const results = await mediaService.uploadBatch(files, typeHints);
      setUploads((u) => [
        ...u,
        ...results.map((res, idx) => {
          const t = typeHints[idx];
          const normalized = (res?.type || t || '').toLowerCase();
          const mediaType = normalized === 'image' ? 'Image'
            : normalized === 'video' ? 'Video'
              : normalized === 'audio' ? 'Audio'
                : 'Other';
          return {
            url: res.url,
            mediaType,
            mimeType: res.mimeType || files[idx].type,
            sizeBytes: res.sizeBytes ?? files[idx].size,
            thumbnailUrl: res.thumbnailUrl || null
          };
        })
      ]);
      toast.success('Файлы загружены');
    } catch (e1) {
      toast.error(e1.response?.data || 'Ошибка загрузки файла');
    }
  }

  async function onSend(e) {
    e.preventDefault();
    if (!message && uploads.length === 0) return;
    setSending(true);
    try {
      const saved = await messagesService.send({
        recipientId: otherUserId,
        content: message,
        attachments: uploads
      });
      setList((prev) => [...(prev || []), saved]);
      setMessage('');
      setUploads([]);
      if (typingStateRef.current) {
        sendTyping(otherUserId, false);
        typingStateRef.current = false;
      }
      setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }), 50);
    } catch (e2) {
      const status = e2.response?.status;
      if (status === 429) toast.error('Слишком часто. Попробуйте позже.');
      else if (status === 403) toast.error('Диалог запрещён приватностью/блокировкой');
      else toast.error(e2.response?.data || 'Не удалось отправить');
    } finally {
      setSending(false);
    }
  }

  const resolveDisplayName = () => {
    if (!profile) return `Пользователь #${otherUserId}`;
    const fullName = profile.profile?.fullName?.trim();
    const username = profile.profile?.username?.trim() || profile.username?.trim();
    return fullName || username || `Пользователь #${otherUserId}`;
  };

  const resolveStatus = () => {
    if (presence?.isTyping) return 'пишет...';
    if (presence?.status === 'online') return 'онлайн';
    if (presence?.lastSeenUtc) {
      return `был(а) в ${new Date(presence.lastSeenUtc).toLocaleString()}`;
    }
    return 'офлайн';
  };

  const formatTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedMessages = (list || []).reduce((acc, messageItem) => {
    const createdAt = new Date(messageItem.createdAt);
    const dateKey = createdAt.toLocaleDateString('sv-SE');
    const dateLabel = createdAt.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const lastGroup = acc[acc.length - 1];
    if (!lastGroup || lastGroup.dateKey !== dateKey) {
      acc.push({ dateKey, dateLabel, items: [messageItem] });
    } else {
      lastGroup.items.push(messageItem);
    }
    return acc;
  }, []);

  const handleBlockUser = async () => {
    setBlocking(true);
    try {
      await blocksService.block(otherUserId);
      toast.success('Пользователь заблокирован');
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось заблокировать');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">{resolveDisplayName()}</h1>
          <div className="text-xs opacity-70">{resolveStatus()}</div>
        </div>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm btn-square" title="Меню">
            ☰
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <Link to={`/users/${otherUserId}`}>Открыть профиль</Link>
            </li>
            <li>
              <button type="button" onClick={() => setReportOpen(true)}>Пожаловаться</button>
            </li>
            <li>
              <button type="button" onClick={handleBlockUser} disabled={blocking}>
                {blocking ? 'Блокировка...' : 'Заблокировать'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto bg-base-100 rounded-lg p-4 space-y-2">
        {hasMore && (
          <button className="btn btn-xs btn-outline w-full mb-2" onClick={() => loadPage(page + 1)}>
            Загрузить ещё
          </button>
        )}

        {!list && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.dateKey} className="space-y-2">
            <div className="divider text-xs opacity-70">{group.dateLabel}</div>
            {group.items.map((m) => (
              <div key={m.id} className={`chat ${m.isOwn ? 'chat-end' : (m.senderId === otherUserId ? 'chat-start' : 'chat-end')}`}>
                <div className="chat-header">
                  {m.senderId === otherUserId ? `#${otherUserId}` : 'Вы'}
                  <time className="text-xs opacity-50 ml-2">{formatTime(m.createdAt)}</time>
                </div>
                <div className="chat-bubble">
                  {m.content}
                  {m.attachments?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.attachments.map((a, i) => (
                        <Attachment key={i} a={a} />
                      ))}
                    </div>
                  )}
                </div>
                {m.isOwn && (
                  <div className="chat-footer text-xs opacity-60">
                    {m.isRead ? `Прочитано${m.readAt ? ` · ${new Date(m.readAt).toLocaleString()}` : ''}` : 'Не прочитано'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* composer */}
      <form onSubmit={onSend} className="mt-3 flex items-end gap-2">
        <label className="btn btn-ghost btn-square" title="Прикрепить файлы">
          <input type="file" hidden multiple onChange={onFilesPicked} />
          📎
        </label>
        <div className="flex-1">
          <textarea
            className="textarea textarea-bordered w-full"
            rows={2}
            placeholder="Напишите сообщение..."
            value={message}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
              if (!typingStateRef.current) {
                typingStateRef.current = true;
                sendTyping(otherUserId, true);
              }
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                if (typingStateRef.current) {
                  typingStateRef.current = false;
                  sendTyping(otherUserId, false);
                }
              }, 2000);
            }}
          />
          {uploads.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <div className="text-xs opacity-70 mr-2">Файлы: {uploads.length}/{MAX_ATTACH}</div>
              {uploads.map((u, idx) => (
                <div key={idx} className="badge badge-outline gap-2">
                  <span className="truncate max-w-[140px]">{u.url.split('/').pop()}</span>
                  <button type="button" onClick={() => setUploads((arr) => arr.filter((_, i) => i !== idx))} className="ml-1">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className={`btn btn-primary ${sending ? 'loading' : ''}`} disabled={sending}>Отправить</button>
      </form>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        subject={{ type: 'user', userId: otherUserId }}
      />
    </motion.div>
  );
}

function Attachment({ a }) {
  if (a.mediaType === 'Image') {
    return <img src={a.url} alt="" className="max-h-40 rounded" />;
  }
  if (a.mediaType === 'Video') {
    return <video src={a.url} controls className="max-h-48 rounded" />;
  }
  if (a.mediaType === 'Audio') {
    return <audio src={a.url} controls />;
  }
  return <a className="link" href={a.url} target="_blank" rel="noreferrer">Файл</a>;
}
