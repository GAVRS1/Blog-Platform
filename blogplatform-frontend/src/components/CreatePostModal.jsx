// src/components/CreatePostModal.jsx
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { mediaService } from '@/services/media';
import { postsService } from '@/services/posts';

const MAX_ATTACH = 10;

export default function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // File[]
  const [attachments, setAttachments] = useState([]); // [{url, type, mimeType, sizeBytes}]
  const [loading, setLoading] = useState(false);

  // Открытие по глобальному событию
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('open-create-post', openHandler);
    return () => window.removeEventListener('open-create-post', openHandler);
  }, []);

  const close = () => {
    if (loading) return;
    setOpen(false);
    setContent('');
    setFiles([]);
    setAttachments([]);
  };

  const onPickFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;
    if ((files.length + list.length) > MAX_ATTACH) {
      toast.error(`Максимум ${MAX_ATTACH} вложений в посте`);
      const allowed = MAX_ATTACH - files.length;
      if (allowed > 0) {
        setFiles((prev) => [...prev, ...list.slice(0, allowed)]);
      }
    } else {
      setFiles((prev) => [...prev, ...list]);
    }
    e.target.value = '';
  };

  const removeFile = (idx) => {
    setFiles((arr) => arr.filter((_, i) => i !== idx));
    setAttachments((arr) => arr.filter((_, i) => i !== idx));
  };

  const mediaTypeFromFile = (file) => {
    const t = file.type.toLowerCase();
    if (t.startsWith('image/')) return 'post_image';
    if (t.startsWith('video/')) return 'post_video';
    if (t.startsWith('audio/')) return 'post_audio';
    return 'post_file';
  };

  const preview = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const uploadAll = async () => {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const type = mediaTypeFromFile(f);
      const res = await mediaService.upload(f, type);
      results.push({
        url: res.url,
        type: type.includes('image') ? 'Image' :
              type.includes('video') ? 'Video' :
              type.includes('audio') ? 'Audio' : 'Other',
        mimeType: f.type,
        sizeBytes: f.size
      });
    }
    setAttachments(results);
    return results;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      toast.error('Добавьте текст или медиа');
      return;
    }
    if (files.length > MAX_ATTACH) {
      toast.error(`Максимум ${MAX_ATTACH} вложений`);
      return;
    }
    setLoading(true);
    try {
      let uploaded = attachments;
      if (files.length > 0 && attachments.length !== files.length) {
        uploaded = await uploadAll();
      }
      const payload = {
        content: content || '',
        attachments: uploaded // [{ url, type: Image|Video|Audio|Other, mimeType, sizeBytes }]
      };
      await postsService.create(payload);
      toast.success('Пост опубликован!');
      window.dispatchEvent(new CustomEvent('post-created'));
      close();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) toast.error('Слишком часто. Попробуйте позже.');
      else if (status === 413) toast.error('Слишком большой файл');
      else toast.error(err.response?.data?.message || 'Не удалось создать пост');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 grid place-items-center px-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="card w-full max-w-2xl bg-base-100 shadow-xl"
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="card-body space-y-3" onSubmit={onSubmit}>
              <div className="flex items-center justify-between">
                <h3 className="card-title">Создать пост</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={close}>✕</button>
              </div>

              <textarea
                className="textarea textarea-bordered w-full"
                rows={4}
                placeholder="Что нового?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Files */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="btn btn-outline btn-sm">
                    Прикрепить файлы
                    <input type="file" hidden multiple onChange={onPickFiles} accept="image/*,video/*,audio/*" />
                  </label>
                  <div className="text-xs opacity-70">Выбрано: {files.length}/{MAX_ATTACH}</div>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="relative group">
                        {f.type.startsWith('image/')
                          ? <img src={preview[i]} alt="" className="rounded-lg max-h-40 w-full object-cover" />
                          : f.type.startsWith('video/')
                          ? <video src={preview[i]} className="rounded-lg max-h-40 w-full object-cover" />
                          : f.type.startsWith('audio/')
                          ? <div className="rounded-lg p-3 bg-base-200">Аудио: {f.name}</div>
                          : <div className="rounded-lg p-3 bg-base-200">Файл: {f.name}</div>
                        }
                        <button
                          type="button"
                          className="btn btn-xs btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                          onClick={() => removeFile(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-actions justify-end">
                <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                  Опубликовать
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
