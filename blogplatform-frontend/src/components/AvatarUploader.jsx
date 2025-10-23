// src/components/AvatarUploader.jsx
import { useRef, useState } from 'react';
import { mediaService } from '@/services/media';
import toast from 'react-hot-toast';

/**
 * Простой загрузчик аватара.
 * Пропсы:
 *  - onUploaded(url: string): коллбэк с полученным от сервера абсолютным/относительным URL
 *  - initialUrl?: string — стартовая картинка (если есть)
 */
export default function AvatarUploader({ onUploaded, initialUrl }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Базовая валидация
    if (!file.type.startsWith('image/')) {
      toast.error('Загрузите изображение (JPEG/PNG/WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Слишком большой файл (макс. 5 МБ)');
      return;
    }

    // Локальный превью сразу
    const urlObject = URL.createObjectURL(file);
    setPreview(urlObject);

    setLoading(true);
    try {
      // stricto: type=image как требует твой /api/Media/upload
      const res = await mediaService.upload(file, 'image');

      // Сервер должен вернуть { url, ... }
      const url = res.url;
      if (!url) {
        throw new Error('Сервер не вернул ссылку на файл');
      }

      // Прокидываем наверх
      onUploaded?.(url);

      toast.success('Аватар загружен');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data || err?.message || 'Не удалось загрузить аватар');
      // если аплоад не удался — откатываем превью
      setPreview(initialUrl || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="avatar">
        <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-200">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="avatar" className="object-cover w-full h-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/avatar.png" alt="avatar" className="object-cover w-full h-full" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button type="button" className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={onPick} disabled={loading}>
          {loading ? 'Загрузка…' : 'Выбрать файл'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
        <p className="text-xs opacity-70">PNG/JPEG/WebP • до 5 МБ</p>
      </div>
    </div>
  );
}
