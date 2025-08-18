import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ` +
      (isActive ? 'bg-primary text-white' : 'hover:bg-base-300')
    }
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user } = useAuth();

  // абсолютный путь к аватару
  const avatarUrl = user?.profile?.profilePictureUrl
    ? `${import.meta.env.VITE_API_BASE}/uploads/${user.profile.profilePictureUrl.replace(/\\/g, '/')}`
    : '/avatar.png';

  return (
    <aside className="hidden lg:flex w-64 h-[calc(100vh-2rem)] ml-auto mr-4 my-4 bg-base-100 rounded-xl shadow-xl p-4 flex-col gap-4">
      {/* АВАТАР */}
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
        />
        <div>
          <p className="font-bold">{user?.username ?? 'Гость'}</p>
          <p className="text-xs text-base-content/60">онлайн</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <NavItem to="/"        icon="🏠" label="Лента" />
        <NavItem to="/profile" icon="👤" label="Профиль" />
      </nav>

      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </aside>
  );
}