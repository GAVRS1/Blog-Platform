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
import {
  subscribeToRealtimeMessages,
  subscribeToRealtimeReads,
  subscribeToRealtimeStatus
} from '@/realtimeEvents';
import { sendTyping } from '@/realtime';
import ReportModal from '@/components/ReportModal';
import { getAvatarUrl } from '@/utils/avatar';
import MediaPlayer from '@/components/MediaPlayer';
import MediaViewer from '@/components/MediaViewer';

const MAX_ATTACH = 10;
const MAX_TEXTAREA_HEIGHT = 160;
const PaperClipIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M8.5 12.5L12.8 8.2a3 3 0 114.2 4.2l-6.6 6.6a5 5 0 01-7.1-7.1l6.4-6.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const SendIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M21.5 11.5l-17-7 4.5 7-4.5 7 17-7z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 11.5h6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

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
  const [reportOpen, setReportOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blockRel, setBlockRel] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerItems, setViewerItems] = useState([]);

  const containerRef = useRef(null);
  const textAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingStateRef = useRef(false);
  const pendingSentIdsRef = useRef(new Set());
  useEffect(() => {
    loadPage(1, true);
    markReadAndSync();
    loadProfile();
    loadBlockRelation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId]);

  useEffect(() => {
    const unsubscribeMessages = subscribeToRealtimeMessages((incoming) => {
      if (!incoming) return;
      const isOwn = user?.id && incoming.senderId === user.id;
      const matchesDialog = incoming.senderId === otherUserId || incoming.recipientId === otherUserId;
      if (!matchesDialog) return;
      if (isOwn && pendingSentIdsRef.current.has(incoming.id)) {
        pendingSentIdsRef.current.delete(incoming.id);
        return;
      }

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

    const unsubscribeReads = subscribeToRealtimeReads((payload) => {
      if (!payload?.updatedMessages?.length) return;
      const { readerId, senderId, updatedMessages } = payload;
      const matchesDialog = readerId === otherUserId || senderId === otherUserId;
      if (!matchesDialog) return;

      setList((prev) => {
        if (!prev) return prev;
        const updates = new Map(updatedMessages.map((item) => [item.id, item]));
        return prev.map((item) => {
          const update = updates.get(item.id);
          if (!update) return item;
          return { ...item, isRead: update.isRead, readAt: update.readAt };
        });
      });
    });

    const unsubscribeStatus = subscribeToRealtimeStatus((status) => {
      if (!status) return;
      if (status.type === 'reconnected' || status.type === 'connected') {
        loadPage(1, true);
        markReadAndSync();
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeReads();
      unsubscribeStatus();
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

  const resizeTextarea = () => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  async function loadPage(p, replace = false) {
    try {
      const data = await messagesService.getDialog(otherUserId, p, 30);
      if (replace) {
        setList(data);
      } else {
        setList((prev) => {
          const existing = prev || [];
          const existingIds = new Set(existing.map((item) => item.id));
          const merged = [
            ...data.filter((item) => !existingIds.has(item.id)),
            ...existing
          ];
          return merged;
        });
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
      try {
        const publicData = await usersService.getPublicById(otherUserId);
        setProfile(publicData);
      } catch {
        setProfile(null);
      }
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
    if (blockRel?.iBlocked || blockRel?.blockedMe) {
      toast.error('Вы не можете отправлять сообщения этому пользователю');
      return;
    }
    if (!message && uploads.length === 0) return;
    setSending(true);
    try {
      const saved = await messagesService.send({
        recipientId: otherUserId,
        content: message,
        attachments: uploads
      });
      pendingSentIdsRef.current.add(saved.id);
      setList((prev) => {
        const existing = prev || [];
        if (existing.some((item) => item.id === saved.id)) {
          return existing;
        }
        return [...existing, saved];
      });
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
    if (!profile) return 'Пользователь';
    const fullName = profile.profile?.fullName?.trim();
    const username = profile.profile?.username?.trim() || profile.username?.trim();
    return fullName || username || 'Пользователь';
  };

  const formatTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const resolveAvatarUrl = (isOtherUser) => (
    getAvatarUrl(isOtherUser ? profile?.profile?.profilePictureUrl : user?.profile?.profilePictureUrl)
  );

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
      await loadBlockRelation();
    } catch (e) {
      toast.error(e.response?.data || 'Не удалось заблокировать');
    } finally {
      setBlocking(false);
    }
  };

  async function loadBlockRelation() {
    try {
      const rel = await blocksService.relationship(otherUserId);
      setBlockRel(rel);
    } catch {
      setBlockRel(null);
    }
  }

  const openViewer = (items, index) => {
    setViewerItems(items || []);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const isBlocked = blockRel?.iBlocked || blockRel?.blockedMe;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-6rem)] flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">{resolveDisplayName()}</h1>
        </div>
        <div className="dropdown dropdown-end relative">
          <label tabIndex={0} className="btn btn-ghost btn-sm btn-square" title="Меню">
            ☰
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 absolute z-50">
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

      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto bg-base-100 rounded-lg p-4 space-y-2">
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
            {group.items.map((m) => {
              const isOwn = m.senderId === user?.id;
              return (
              <div key={m.id} className={`chat ${isOwn ? 'chat-end' : 'chat-start'}`}>
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img
                      src={resolveAvatarUrl(!isOwn)}
                      alt={!isOwn ? resolveDisplayName() : user?.username || 'Вы'}
                    />
                  </div>
                </div>
                <div className="chat-header">
                  {!isOwn ? resolveDisplayName() : 'Вы'}
                  <time className="text-xs opacity-50 ml-2">{formatTime(m.createdAt)}</time>
                </div>
                <div className="chat-bubble">
                  {m.content}
                  {m.attachments?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.attachments.map((a, i) => (
                        <button
                          key={i}
                          type="button"
                          className="block w-full text-left"
                          onClick={() => openViewer(m.attachments, i)}
                        >
                          <MediaPlayer media={a} type={a.mediaType} url={a.url} />
                        </button>
                      ))}
                    </div>
                    )}
                  </div>
                {isOwn && (
                  <div className="chat-footer text-xs opacity-60">
                    {m.isRead ? 'Прочитано' : 'Не прочитано'}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* composer */}
      <form onSubmit={onSend} className="mt-auto pt-3 flex items-center gap-2">
        <label className="btn btn-ghost btn-square min-h-[48px] h-12" title="Прикрепить файлы">
          <input type="file" hidden multiple onChange={onFilesPicked} disabled={isBlocked} />
          <PaperClipIcon className="h-5 w-5" />
        </label>
        <div className="flex-1">
          <textarea
            ref={textAreaRef}
            className="textarea textarea-bordered w-full resize-none leading-5 min-h-[48px]"
            rows={1}
            placeholder={isBlocked ? 'Вы не можете отправлять сообщения этому пользователю' : 'Напишите сообщение...'}
            value={message}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
              resizeTextarea();
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
            disabled={isBlocked}
          />
          {isBlocked && (
            <div className="text-xs opacity-60 mt-2">Вы не можете отправлять сообщения этому пользователю.</div>
          )}
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
        <button
          type="submit"
          className={`btn btn-primary btn-square min-h-[48px] h-12 ${sending ? 'loading' : ''}`}
          disabled={sending || isBlocked}
          aria-label="Отправить сообщение"
          title="Отправить"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        subject={{ type: 'user', userId: otherUserId }}
      />
      <MediaViewer
        open={viewerOpen}
        items={viewerItems}
        startIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </motion.div>
  );
}
