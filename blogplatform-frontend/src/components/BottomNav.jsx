// src/components/BottomNav.jsx
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { messagesService } from '@/services/messages';
import { notificationsService } from '@/services/notifications';

export default function BottomNav() {
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
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
  }, []);

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