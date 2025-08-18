import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function MediaPlayer({ url, type, className = '' }) {
  if (!url) return null;

  // если url уже начинается со слеша – не добавляем ещё один
  const src = `${import.meta.env.VITE_API_BASE}${url.startsWith('/') ? url : `/${url}`}`;

  switch (type) {
    case 'image':
      return (
        <LazyLoadImage
          src={src}
          alt="content"
          effect="blur"
          className={`w-full rounded-xl ${className}`}
        />
      );
    case 'video':
      return (
        <video
          src={src}
          controls
          className={`w-full rounded-xl ${className}`}
        />
      );
    case 'audio':
      return (
        <audio
          src={src}
          controls
          className={`w-full rounded-xl ${className}`}
        />
      );
    default:
      return null;
  }
}