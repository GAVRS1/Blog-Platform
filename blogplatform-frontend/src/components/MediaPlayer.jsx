// src/components/MediaPlayer.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
    const baseUrl = import.meta.env.VITE_API_BASE || 'https://localhost:7141';
    
    // Если путь уже содержит /uploads/, не дублируем
    if (cleaned.startsWith('uploads/')) {
      return `${baseUrl}/${cleaned}`;
    }
    
    return `${baseUrl}/uploads/${cleaned}`;
  };

  const src = getMediaUrl(url);
  
  if (!src) return null;

  const handleError = () => {
    console.error('Media loading error:', src);
    setError(true);
  };

  switch (type) {
    case 'image':
      return (
        <div className={`relative overflow-hidden rounded-lg ${className}`}>
          <LazyLoadImage
            src={src}
            alt="Изображение поста"
            className="w-full h-auto object-cover"
            effect="blur"
            onError={handleError}
            wrapperClassName="w-full"
            placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23374151'%3EЗагрузка...%3C/text%3E%3C/svg%3E"
          />
        </div>
      );
      
    case 'video':
      return (
        <div className={`relative overflow-hidden rounded-lg bg-black ${className}`}>
          <video
            src={src}
            className="w-full h-auto"
            controls
            onError={handleError}
            preload="metadata"
          >
            <source src={src} type="video/mp4" />
            <source src={src} type="video/webm" />
            <source src={src} type="video/ogg" />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      );
      
    case 'audio':
      return (
        <div className={`w-full ${className}`}>
          <audio
            src={src}
            className="w-full"
            controls
            onError={handleError}
            preload="metadata"
          >
            <source src={src} type="audio/mp3" />
            <source src={src} type="audio/wav" />
            <source src={src} type="audio/ogg" />
            Ваш браузер не поддерживает аудио.
          </audio>
        </div>
      );
      
    default:
      return null;
  }
}