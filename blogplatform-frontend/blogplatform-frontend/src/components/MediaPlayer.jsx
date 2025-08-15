export default function MediaPlayer({ url, type }) {
    if (!url) return null;

    const src = `https://localhost:7141/uploads/${url}`;

    if (type === 'image') return <img src={src} alt="media" className="post-image" />;
    if (type === 'video') return <video src={src} controls className="post-video" />;
    if (type === 'audio') return <audio src={src} controls className="post-audio" />;
    return null;
}