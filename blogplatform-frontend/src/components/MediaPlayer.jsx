// src/components/MediaPlayer.jsx
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useState } from 'react';

export default function MediaPlayer({ url, type, className = '', onClick }) { // Добавлен onClick пропс
  const [error, setError] = useState(false);

  if (!url || error) return null;

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith('http')) return mediaUrl;
    const cleaned = mediaUrl.replace(/^\/+/, '').replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_BASE}/uploads/${cleaned}`;
  };

  const src = getMediaUrl(url);
  if (!src) return null;

  const handleError = () => {
    setError(true);
  };

  if (type === 'image') {
    return (
      // Контейнер для центрирования и фона
      <div 
        className={`flex justify-center items-center bg-base-200 rounded-xl overflow-hidden ${className}`} // Добавлен overflow-hidden
        onClick={onClick} // Передаем onClick контейнеру
      >
        <LazyLoadImage
          src={src}
          alt="Изображение поста"
          effect="blur"
          // Убираем w-full и object-cover с контейнера, применяем к изображению
          // max-w-full max-h-full гарантирует, что изображение не выйдет за рамки контейнера
          // object-contain сохраняет пропорции, показывая всё изображение
          // Если нужно обрезать (object-cover), укажите фиксированную высоту контейнера
          className="max-w-full max-h-full object-contain rounded-xl cursor-pointer" // Добавлен cursor-pointer
          onError={handleError}
          placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij7QmNC30L7QsdGA0LDQttC10L3QuNC1PC90ZXh0Pjwvc3ZnPg=="
        />
      </div>
    );
  }

  // Для видео и аудио оставляем почти как было, но уточняем стили
  if (type === 'video') {
    return (
      <video
        src={src}
        controls
        // className={`w-full rounded-xl ${className}`} // Старый стиль
        className={`w-full max-h-96 rounded-xl ${className}`} // Ограничиваем высоту видео
        onError={handleError}
        preload="metadata"
        playsInline
        webkit-playsinline
      >
        Ваш браузер не поддерживает воспроизведение видео.
      </video>
    );
  }

  if (type === 'audio') {
    return (
      <div className={`w-full p-4 bg-base-200 rounded-xl ${className}`}>
        <audio
          src={src}
          controls
          className="w-full"
          onError={handleError}
          preload="metadata"
        >
          Ваш браузер не поддерживает воспроизведение аудио.
        </audio>
      </div>
    );
  }

  return null;
}