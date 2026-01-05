import { API_BASE } from '../api/config';

export const getAvatarUrl = (avatarPath) => {
  // Если путь пустой или null, возвращаем дефолтный аватар
  if (!avatarPath) {
    return '/avatar.png';
  }

  // Если это уже полный URL, возвращаем как есть
  if (/^https?:\/\//i.test(avatarPath) || avatarPath.startsWith('//')) {
    return avatarPath;
  }

  // Если это путь относительно uploads
  const base = API_BASE || '';

  const cleaned = (avatarPath || '')
    .replace(/\\/g, '/') // заменяем обратные слеши на прямые
    .trim();

  if (cleaned.startsWith('/uploads/')) {
    return `${base}${cleaned}`;
  }

  if (cleaned.startsWith('/')) {
    return `${base}${cleaned}`;
  }

  const cleanPath = cleaned.replace(/^\/+/, '').replace(/^uploads\//, '');
  return `${base}/uploads/${cleanPath}`;
};

// Дополнительная функция для проверки валидности аватара
export const isValidAvatarUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Функция для получения инициалов из имени как fallback
export const getInitials = (fullName) => {
  if (!fullName) return '?';
  
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};
