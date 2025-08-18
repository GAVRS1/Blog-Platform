import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function MediaPlayer({ url, type, className = '' }) {
  if (!url) return null;
  const src = `${import.meta.env.VITE_API_BASE}/uploads/${url}`;
  const webp = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  switch (type) {
    case 'image':
      return (
        <LazyLoadImage
          src={webp}
          srcSet={`${webp} 1x, ${src} 2x`}
          placeholderSrc={src}
          alt="content"
          effect="blur"
          className={`w-full rounded-xl ${className}`}
          onError={(e) => {
            e.target.src = '/placeholder.jpg'; // Placeholder image
          }}
        />
      );
    case 'video':
      return (
        <video
          src={src}
          controls
          className={`w-full rounded-xl ${className}`}
          onError={(e) => {
            e.target.src = '/placeholder.mp4'; // Placeholder video
          }}
        />
      );
    case 'audio':
      return (
        <audio
          src={src}
          controls
          className={`w-full rounded-xl ${className}`}
          onError={(e) => {
            e.target.src = '/placeholder.mp3'; // Placeholder audio
          }}
        />
      );
    default:
      return null;
  }
}