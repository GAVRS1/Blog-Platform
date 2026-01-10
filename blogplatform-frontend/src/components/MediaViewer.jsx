import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '@/api/config';

function normalizeType(rawType = '') {
  const normalized = rawType.toString().toLowerCase();
  if (normalized.includes('image')) return 'image';
  if (normalized.includes('video')) return 'video';
  if (normalized.includes('audio')) return 'audio';
  if (normalized.includes('other') || normalized.includes('file')) return 'file';
  return 'file';
}

function getMediaUrl(mediaUrl) {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith('http')) return mediaUrl;

  const cleaned = mediaUrl.replace(/\\/g, '/');
  const base = API_BASE || '';
  if (cleaned.startsWith('/uploads')) {
    return `${base}${cleaned}`;
  }
  if (cleaned.startsWith('uploads/')) {
    return `${base}/${cleaned}`;
  }
  const normalized = cleaned.replace(/^\/+/, '');
  return `${base}/uploads/${normalized}`;
}

function getBaseFileName(value = '') {
  const cleaned = value.toString().replace(/\\/g, '/');
  const parts = cleaned.split('/');
  return parts[parts.length - 1] || '';
}

function getHeaderTitle(current) {
  const baseName = getBaseFileName(current?.fileName);
  if (baseName) return baseName;
  if (current?.type === 'image') return 'Изображение';
  if (current?.type === 'video') return 'Видео';
  if (current?.type === 'audio') return 'Аудио';
  if (current?.type === 'file') return 'Файл';
  return 'Медиа';
}

export default function MediaViewer({ open, items = [], startIndex = 0, onClose }) {
  const normalizedItems = useMemo(() => (
    items.map((item) => {
      const rawUrl = item?.url || item?.thumbnailUrl;
      const type = normalizeType(item?.type || item?.mediaType);
      return {
        ...item,
        src: getMediaUrl(rawUrl),
        type
      };
    })
  ), [items]);

  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (open) {
      setIndex(startIndex || 0);
    }
  }, [open, startIndex]);

  useEffect(() => {
    if (!open || normalizedItems.length === 0) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') {
        setIndex((prev) => (prev + 1) % normalizedItems.length);
      }
      if (event.key === 'ArrowLeft') {
        setIndex((prev) => (prev - 1 + normalizedItems.length) % normalizedItems.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [normalizedItems.length, onClose, open]);

  if (!open || normalizedItems.length === 0) return null;

  const current = normalizedItems[index] || normalizedItems[0];
  const canNavigate = normalizedItems.length > 1;

  const goPrev = () => setIndex((prev) => (prev - 1 + normalizedItems.length) % normalizedItems.length);
  const goNext = () => setIndex((prev) => (prev + 1) % normalizedItems.length);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-5xl bg-base-100 rounded-xl shadow-xl overflow-hidden"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-base-200">
              <div className="text-sm opacity-70 truncate">
                {getHeaderTitle(current)}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                ✕
              </button>
            </div>

            <div className="relative bg-base-200 p-4 min-h-[200px] flex items-center justify-center">
              {!current?.src && (
                <div className="text-sm opacity-70">Файл недоступен для просмотра</div>
              )}
              {current?.src && current.type === 'image' && (
                <img src={current.src} alt="" className="max-h-[70vh] w-auto rounded-lg" />
              )}
              {current?.src && current.type === 'video' && (
                <video src={current.src} controls className="max-h-[70vh] w-full rounded-lg" />
              )}
              {current?.src && current.type === 'audio' && (
                <div className="w-full max-w-xl bg-base-100 rounded-lg p-4">
                  <audio src={current.src} controls className="w-full" />
                </div>
              )}
              {current?.src && current.type === 'file' && (
                <a
                  href={current.src}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  Открыть файл
                </a>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 text-xs opacity-60">
              <div>{index + 1} / {normalizedItems.length}</div>
              {canNavigate && (
                <div className="flex items-center gap-2">
                  <span>← → для навигации</span>
                </div>
              )}
            </div>

            {canNavigate && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="btn btn-circle btn-sm absolute left-3 top-1/2 -translate-y-1/2"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="btn btn-circle btn-sm absolute right-3 top-1/2 -translate-y-1/2"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
