export const getAvatarUrl = (avatarPath) => {
  // Если путь пустой или null, возвращаем дефолтный аватар
  if (!avatarPath) {
    return '/avatar.png';
  }

  // Если это уже полный URL, возвращаем как есть
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // Если это путь относительно uploads
  if (avatarPath.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_BASE}${avatarPath}`;
  }

  // Очищаем путь от лишних символов и формируем правильный URL
  const cleanPath = avatarPath
    .replace(/\\/g, '/') // заменяем обратные слеши на прямые
    .replace(/^\/+/, '') // убираем ведущие слеши
    .replace(/^uploads\//, ''); // убираем дублирующийся uploads

  return `${import.meta.env.VITE_API_BASE}/uploads/${cleanPath}`;
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
};ы