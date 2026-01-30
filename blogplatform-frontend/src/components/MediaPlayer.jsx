import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useMemo, useState } from 'react';
import { resolveMediaUrl } from '@/utils/media';

export default function MediaPlayer({ media, url, type, className = '' }) {
  const [error, setError] = useState(false);

  const resolved = useMemo(() => {
    const source = media || {};
    const rawUrl = url || source.url || source.thumbnailUrl;
    const rawType = (type || source.type || source.mediaType || '').toString().toLowerCase();

    const normalizedType = rawType.includes('image')
      ? 'image'
      : rawType.includes('video')
      ? 'video'
      : rawType.includes('audio')
      ? 'audio'
      : rawType.includes('other') || rawType.includes('file')
      ? 'file'
      : undefined;

    return { rawUrl, normalizedType };
  }, [media, type, url]);

  if (!resolved.rawUrl || error) return null;

  const src = resolveMediaUrl(resolved.rawUrl);

  if (!src) return null;

  const handleError = () => {
    setError(true);
  };

  switch (resolved.normalizedType) {
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
          webkit-playsinline="true"
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
      return (
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className={`w-full p-4 bg-base-200 rounded-xl flex items-center gap-2 hover:bg-base-300 transition ${className}`}
        >
          📎 <span className="truncate">{media?.fileName || 'Вложение'}</span>
        </a>
      );
  }
}
