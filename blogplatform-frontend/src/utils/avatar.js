export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '/avatar.png';
  return `${import.meta.env.VITE_API_BASE}/uploads/${avatarPath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')}`;
};