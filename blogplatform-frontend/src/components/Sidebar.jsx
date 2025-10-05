// src/components/Sidebar.jsx
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { messagesService } from '@/services/messages';
import { notificationsService } from '@/services/notifications';

const NavItem = ({ to, children, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `btn btn-md justify-start w-full text-left text-base font-medium transition-all duration-200 ` +
      (isActive
        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
        : 'bg-base-100 hover:bg-base-200')}>
    <span className="flex items-center gap-3 w-full">
      <span className="truncate">{children}</span>
      {badge ? <span className="badge badge-primary ml-auto">{badge}</span> : null}
    </span>
  </NavLink>
);

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const n = await notificationsService.unreadCount();
        setUnreadNotif(n.unread || 0);
      } catch {}
      try {
        const inbox = await messagesService.getInbox();
        const sum = (inbox || []).reduce((acc, x) => acc + (x.unreadCount || 0), 0);
        setUnreadMsgs(sum);
      } catch {}
    })();
  }, [user]);

  const openComposer = () => window.dispatchEvent(new CustomEvent('open-create-post'));

  return (
    <aside className="sticky top-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {/* Профиль */}
        {user && (
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={user?.profile?.profilePictureUrl || '/avatar.png'} alt="" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">@{user.username}</div>
                  <div className="text-xs opacity-70">{user.status}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/profile')}>
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
        <nav className="grid gap-2">
          <NavItem to="/">🏠 Лента</NavItem>
          <NavItem to="/messages" badge={unreadMsgs || undefined}>💬 Сообщения</NavItem>
          <NavItem to="/notifications" badge={unreadNotif || undefined}>🔔 Уведомления</NavItem>
          <NavItem to="/settings">⚙️ Настройки</NavItem>
          <NavItem to="/blocks">🚫 Блокировки</NavItem>
          {user?.status === 'Admin' && <NavItem to="/admin">🛡️ Админ-панель</NavItem>}

          <button onClick={openComposer} className="btn btn-accent mt-1">
            <span className="flex items-center gap-2">
              <i className="fas fa-plus"></i>
              <span>Создать пост</span>
            </span>
          </button>
        </nav>

        {/* Тема */}
        <div className="flex justify-center pt-4 border-t border-base-300/50">
          <ThemeToggle />
        </div>
      </motion.div>
    </aside>
  );
}
