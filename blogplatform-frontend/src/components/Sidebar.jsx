// src/components/Sidebar.jsx
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS, isPublicNavPath } from '@/config/navigation';
import { useUnreadBadges } from '@/hooks/useUnreadBadges';
import { getAvatarUrl } from '@/utils/avatar';

const NavItem = ({ to, label, icon, badge, badgeClass, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `btn btn-md justify-start w-full text-left text-base font-medium transition-all duration-200 ` +
      (isActive
        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
        : 'bg-base-100 hover:bg-base-200')}>
    <span className="flex items-center gap-3 w-full">
      <i className={`fas ${icon}`} aria-hidden></i>
      <span className="truncate">{label}</span>
      {badge ? <span className={`badge ${badgeClass || 'badge-primary'} ml-auto`}>{badge}</span> : null}
    </span>
  </NavLink>
);

export default function Sidebar({
  placements = ['desktop'],
  onNavigate,
  containerClassName = 'sticky top-[var(--topbar-height)]',
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navCollapsed, setNavCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('sidebar-nav-collapsed') === 'true';
  });
  const isPublic = isPublicNavPath(location.pathname);
  const { messages: unreadMsgs, notifications: unreadNotif } = useUnreadBadges({
    user,
    enabled: !!user && !isPublic,
  });
  const displayName = user?.profile?.fullName?.trim() || user?.username || '';
  const userHandle = user?.username ? `@${user.username}` : '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('sidebar-nav-collapsed', String(navCollapsed));
  }, [navCollapsed]);

  const openComposer = () => window.dispatchEvent(new CustomEvent('open-create-post'));
  if (isPublic) return null;

  const navItems = NAV_ITEMS.filter(item => placements.some(placement => item.placements.includes(placement))).filter(
    item => {
    if (!item.roles?.length) return true;
    return !!user && item.roles.includes(user.status);
  });
  const navBadges = { messages: unreadMsgs, notifications: unreadNotif };

  return (
    <aside className={containerClassName}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {/* Профиль */}
        {user && (
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={getAvatarUrl(user?.profile?.profilePictureUrl)} alt="" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{displayName}</div>
                  {userHandle ? <div className="text-xs opacity-70 truncate">{userHandle}</div> : null}
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm mt-3"
                onClick={() => {
                  navigate('/profile');
                  onNavigate?.();
                }}>
                Мой профиль
              </button>
              {user.status === 'Banned' && (
                <div className="alert alert-warning mt-3">
                  <div>
                    Аккаунт ограничен. <a className="link" href="/appeal">Подать апелляцию</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Навигация */}
        <div className="flex justify-center">
          <motion.button
            type="button"
            onClick={() => setNavCollapsed(prev => !prev)}
            className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-full text-base-content/60"
            aria-label={navCollapsed ? 'Показать меню' : 'Скрыть меню'}
            animate={{ y: navCollapsed ? 0 : 6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <i
              className={`fas fa-chevron-down transition-transform duration-200 ${
                navCollapsed ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            ></i>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {!navCollapsed && (
            <motion.nav
              className="grid gap-2 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}>
              {navItems.map(item => (
                <NavItem
                  key={item.key}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  badgeClass={item.badgeClass}
                  badge={item.badgeKey ? navBadges[item.badgeKey] || undefined : undefined}
                  onClick={onNavigate}
                />
              ))}

              <button
                onClick={() => {
                  openComposer();
                  onNavigate?.();
                }}
                className="btn btn-accent mt-1">
                <span className="flex items-center gap-2">
                  <i className="fas fa-plus"></i>
                  <span>Создать пост</span>
                </span>
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Тема */}
        <div className="flex justify-center pt-4 border-t border-base-300/50">
          <ThemeToggle />
        </div>
      </motion.div>
    </aside>
  );
}
