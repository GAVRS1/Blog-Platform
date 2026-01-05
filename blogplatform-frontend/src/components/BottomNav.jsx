import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS, isPublicNavPath } from '@/config/navigation';
import { useUnreadBadges } from '@/hooks/useUnreadBadges';

export default function BottomNav() {
  const { user } = useAuth();
  const loc = useLocation();
  const isPublicRoute = isPublicNavPath(loc.pathname);
  const { messages: unreadMsgs, notifications: unreadNotif } = useUnreadBadges({
    user,
    enabled: !!user && !isPublicRoute,
  });

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

  if (isPublicRoute) return null;

  const mobileItems = NAV_ITEMS.filter(item => item.placements.includes('mobile')).filter(item => {
    if (!item.roles?.length) return true;
    return !!user && item.roles.includes(user.status);
  });

  const badges = {
    messages: unreadMsgs,
    notifications: unreadNotif,
  };

  return (
    <div className="relative">
      <div className="btm-nav bg-base-100 border-t border-base-300">
        {mobileItems.map(item => (
          <NavLink key={item.key} to={item.to} className={linkClass}>
            {({ isActive }) => (
              <span className="relative flex items-center gap-2">
                {item.key === 'profile' ? renderProfileIcon(isActive) : <i className={`fas ${item.icon}`}></i>}
                {item.badgeKey && badges[item.badgeKey] > 0 && (
                  <span className={`badge badge-xs ${item.badgeClass || 'badge-primary'} absolute -top-1 -right-2`}>
                    {badges[item.badgeKey]}
                  </span>
                )}
              </span>
            )}
          </NavLink>
        ))}
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
