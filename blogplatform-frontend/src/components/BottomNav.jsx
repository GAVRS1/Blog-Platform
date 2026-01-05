import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { messagesService } from '@/services/messages';
import { notificationsService } from '@/services/notifications';

const PUBLIC = ['/login', '/register', '/verify', '/appeal', '/404'];

export default function BottomNav() {
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const { user } = useAuth();
  const loc = useLocation();
  const isPublicRoute = PUBLIC.some(p => loc.pathname.startsWith(p));

  useEffect(() => {
    if (!user || isPublicRoute) {
      setUnreadNotif(0);
      setUnreadMsgs(0);
      return; // ← НИЧЕГО НЕ ЗАПРАШИВАЕМ до логина
    }

    let alive = true;
    (async () => {
      try {
        const n = await notificationsService.unreadCount();
        if (alive) setUnreadNotif(n.unread || 0);
      } catch {}
      try {
        const inbox = await messagesService.getInbox();
        if (alive) {
          const sum = (inbox || []).reduce((acc, x) => acc + (x.unreadCount || 0), 0);
          setUnreadMsgs(sum);
        }
      } catch {}
    })();

    return () => { alive = false; };
  }, [isPublicRoute, loc.pathname, user]);

  const linkClass = ({ isActive }) =>
    `btn btn-ghost rounded-none flex-1 flex items-center justify-center ${isActive ? 'text-primary' : 'text-base-content'}`;

  const profileInitial = (user?.profile?.fullName || user?.username || '')
    .trim()
    .charAt(0)
    .toUpperCase() || '?';

  const renderProfileIcon = isActive => {
    if (!user || isPublicRoute) {
      return <i className="fas fa-user"></i>;
    }

    if (user.profile?.profilePictureUrl) {
      return (
        <span className="avatar">
          <div className={`w-8 rounded-full ${isActive ? 'ring ring-primary ring-offset-base-100 ring-offset-2' : ''}`}>
            <img src={user.profile.profilePictureUrl} alt={user.username} />
          </div>
        </span>
      );
    }

    return (
      <span className="avatar placeholder">
        <div className={`w-8 rounded-full uppercase ${isActive ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>
          <span className="text-sm font-semibold">{profileInitial}</span>
        </div>
      </span>
    );
  };

  const openComposer = () => window.dispatchEvent(new CustomEvent('open-create-post'));

  return (
    <div className="relative">
      <div className="btm-nav bg-base-100 border-t border-base-300">
        <NavLink to="/" className={linkClass}><i className="fas fa-home"></i></NavLink>
        <NavLink to="/messages" className={linkClass}>
          <span className="relative">
            <i className="fas fa-comments"></i>
            {unreadMsgs > 0 && <span className="badge badge-xs badge-primary absolute -top-1 -right-2">{unreadMsgs}</span>}
          </span>
        </NavLink>
        <NavLink to="/notifications" className={linkClass}>
          <span className="relative">
            <i className="fas fa-bell"></i>
            {unreadNotif > 0 && <span className="badge badge-xs badge-secondary absolute -top-1 -right-2">{unreadNotif}</span>}
          </span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          {({ isActive }) => (
            <span className="flex items-center gap-2">
              {renderProfileIcon(isActive)}
            </span>
          )}
        </NavLink>
        <NavLink to="/settings" className={linkClass}><i className="fas fa-cog"></i></NavLink>
      </div>

      <button
        className="btn btn-primary btn-circle absolute -top-5 left-1/2 -translate-x-1/2 shadow-lg"
        onClick={openComposer}
        aria-label="Создать пост"
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
}
