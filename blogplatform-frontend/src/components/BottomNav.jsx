import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { messagesService } from '@/services/messages';
import { notificationsService } from '@/services/notifications';

const PUBLIC = ['/login', '/register', '/verify', '/appeal', '/404'];

export default function BottomNav() {
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const loc = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isPublic = PUBLIC.some(p => loc.pathname.startsWith(p));
    if (!token || isPublic) {
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
  }, [loc.pathname]);

  const linkClass = ({ isActive }) =>
    `btn btn-ghost rounded-none flex-1 ${isActive ? 'text-primary' : 'text-base-content'}`;

  const openComposer = () => window.dispatchEvent(new CustomEvent('open-create-post'));

  return (
    <div className="btm-nav bg-base-100 border-t border-base-300">
      <NavLink to="/" className={linkClass}><i className="fas fa-home"></i></NavLink>
      <NavLink to="/messages" className={linkClass}>
        <span className="relative">
          <i className="fas fa-comments"></i>
          {unreadMsgs > 0 && <span className="badge badge-xs badge-primary absolute -top-1 -right-2">{unreadMsgs}</span>}
        </span>
      </NavLink>
      <button className="btn btn-primary rounded-full -mt-6" onClick={openComposer}>
        <i className="fas fa-plus"></i>
      </button>
      <NavLink to="/notifications" className={linkClass}>
        <span className="relative">
          <i className="fas fa-bell"></i>
          {unreadNotif > 0 && <span className="badge badge-xs badge-secondary absolute -top-1 -right-2">{unreadNotif}</span>}
        </span>
      </NavLink>
      <NavLink to="/settings" className={linkClass}><i className="fas fa-cog"></i></NavLink>
    </div>
  );
}
