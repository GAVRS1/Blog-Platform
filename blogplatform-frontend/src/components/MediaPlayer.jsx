import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useState } from 'react';

export default function MediaPlayer({ url, type, className = '' }) {
  const [error, setError] = useState(false);
  
  if (!url || error) return null;

  // Правильная обработка URL
  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    
    // Если URL уже полный, используем как есть
    if (mediaUrl.startsWith('http')) return mediaUrl;
    
    // Убираем лишние слеши и формируем правильный URL
    const cleaned = mediaUrl.replace(/^\/+/, '').replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_BASE}/uploads/${cleaned}`;
  };

  const src = getMediaUrl(url);
  
  if (!src) return null;

  const handleError = () => {
    setError(true);
  };

  switch (type) {
    case 'image':
      return (
        <LazyLoadImage
          src={src}
          alt="Изображение поста"
          effect="blur"
          className={`w-full rounded-xl object-cover ${className}`}
          onError={handleError}
          placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij7QmNC30L7QsdGA0LDQttC10L3QuNC1PC90ZXh0Pjwvc3ZnPg=="
        />
      );
    case 'video':
      return (
        <video
          src={src}
          controls
          className={`w-full rounded-xl ${className}`}
          onError={handleError}
          preload="metadata"
          playsInline
          webkit-playsinline
        >
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      );
    case 'audio':
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
    default:
      return null;
  }
}