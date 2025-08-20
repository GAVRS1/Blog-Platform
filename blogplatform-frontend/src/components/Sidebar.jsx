import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth'; // ✅ твой хук
import { getAvatarUrl } from '@/utils/avatar';
import { useNavigate } from 'react-router-dom';

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `btn btn-md justify-start w-full text-left text-base font-medium ` +
      (isActive ? 'bg-primary text-white' : 'btn-ghost')
    }
  >
    {children}
  </NavLink>
);

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = user?.profile?.profilePictureUrl
    ? getAvatarUrl(user.profile.profilePictureUrl)
    : '/avatar.png';

  // Пока данные загружаются, можно показать заглушку
  if (user === undefined) return null;

  return (
    <aside className="hidden lg:block sticky top-20 h-fit max-h-[calc(100vh-5rem)] w-64 flex-shrink-0 ml-auto">
      <div className="flex flex-col gap-4 p-4">
        {/* Верхняя строка: тема справа, аватар и имя слева */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">@{user?.username || 'Гость'}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Навигация */}
        <NavItem to="/">🏠 Главная</NavItem>
        <NavItem to="/profile">👤 Профиль</NavItem>

        {/* Кнопка создания поста */}
        <button
          className="btn btn-primary w-full mt-2"
          onClick={() => navigate('/create-post')}
        >
          ➕ Создать пост
        </button>
      </div>
    </aside>
  );
}