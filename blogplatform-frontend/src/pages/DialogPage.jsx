// src/pages/DialogPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { messagesService } from '@/services/messages';
import { mediaService } from '@/services/media';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const MAX_ATTACH = 10;

export default function DialogPage() {
  const { id } = useParams();
  const otherUserId = Number(id);
  const [list, setList] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploads, setUploads] = useState([]); // [{ url, mediaType, mimeType, sizeBytes, thumbnailUrl }]

  const containerRef = useRef(null);

  useEffect(() => {
    loadPage(1, true);
    messagesService.markRead(otherUserId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function mimeToType(file) {
    const t = file.type.toLowerCase();
    if (t.startsWith('image/')) return 'chat_image';
    if (t.startsWith('video/')) return 'chat_video';
    if (t.startsWith('audio/')) return 'chat_audio';
    return 'chat_file';
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
    for (const file of files) {
      try {
        const type = mimeToType(file);
        const res = await mediaService.upload(file, type);
        setUploads((u) => [...u, {
          url: res.url,
          mediaType: type.includes('image') ? 'Image' : type.includes('video') ? 'Video' : type.includes('audio') ? 'Audio' : 'Other',
          mimeType: file.type,
          sizeBytes: file.size,
          thumbnailUrl: null
        }]);
      } catch (e1) {
        toast.error(e1.response?.data || 'Ошибка загрузки файла');
      }
    }
    toast.success('Файлы загружены');
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Диалог с #{otherUserId}</h1>
        <button className="btn btn-sm" onClick={() => loadPage(1, true)}>Обновить</button>
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

        {list?.map(m => (
          <div key={m.id} className={`chat ${m.isOwn ? 'chat-end' : (m.senderId === otherUserId ? 'chat-start' : 'chat-end')}`}>
            <div className="chat-header">
              {m.senderId === otherUserId ? `#${otherUserId}` : 'Вы'}
              <time className="text-xs opacity-50 ml-2">{new Date(m.createdAt).toLocaleString()}</time>
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
            onChange={(e) => setMessage(e.target.value)}
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
