export const NAV_ITEMS = [
  {
    key: 'home',
    to: '/',
    label: 'Лента',
    icon: 'fa-home',
    placements: ['desktop', 'mobile'],
  },
  {
    key: 'messages',
    to: '/messages',
    label: 'Сообщения',
    icon: 'fa-comments',
    badgeKey: 'messages',
    badgeClass: 'badge-primary',
    placements: ['desktop', 'mobile'],
  },
  {
    key: 'notifications',
    to: '/notifications',
    label: 'Уведомления',
    icon: 'fa-bell',
    badgeKey: 'notifications',
    badgeClass: 'badge-secondary',
    placements: ['desktop', 'mobile'],
  },
  {
    key: 'profile',
    to: '/profile',
    label: 'Профиль',
    icon: 'fa-user',
    placements: ['mobile'],
  },
  {
    key: 'settings',
    to: '/settings',
    label: 'Настройки',
    icon: 'fa-cog',
    placements: ['desktop', 'mobile'],
  },
  {
    key: 'admin',
    to: '/admin',
    label: 'Админ-панель',
    icon: 'fa-shield-halved',
    roles: ['Admin'],
    placements: ['desktop', 'mobile'],
  },
];

export const PUBLIC_NAV_PATHS = ['/login', '/register', '/verify', '/appeal', '/blocked', '/404'];

export const isPublicNavPath = (pathname = '') =>
  PUBLIC_NAV_PATHS.some(publicPath => pathname.startsWith(publicPath));
