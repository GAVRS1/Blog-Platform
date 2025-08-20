// src/components/Sidebar.jsx - ДОБАВЛЯЕМ КНОПКУ СОЗДАНИЯ
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import CreatePostModal from '@/components/CreatePostModal';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';
import { useNavigate } from 'react-router-dom';

const NavItem = ({ to, children, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="btn btn-md justify-start w-full text-left text-base font-medium btn-ghost hover:bg-primary/10 hover:scale-[1.02] transition-all duration-200"
      >
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {children}
        </motion.div>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `btn btn-md justify-start w-full text-left text-base font-medium transition-all duration-200 ` +
        (isActive 
          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
          : 'btn-ghost hover:bg-primary/10 hover:scale-[1.02]')
      }
    >
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {children}
      </motion.div>
    </NavLink>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const avatarUrl = user?.profile?.profilePictureUrl
    ? getAvatarUrl(user.profile.profilePictureUrl)
    : '/avatar.png';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <motion.div
        className="hidden lg:flex flex-col h-screen w-80 bg-base-100 shadow-xl border-r border-base-300"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        /* Заголовок */
        <div className="p-6 border-b border-base-300">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            <i className="fab fa-blogger mr-2"></i>
            BlogPlatform
          </h1>
        </div>

        /* Навигация */
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/">
            <i className="fas fa-home mr-3"></i>
            Главная
          </NavItem>
          
          /* НОВАЯ КНОПКА СОЗДАНИЯ ПОСТА */
          <NavItem onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus mr-3"></i>
            Создать пост
          </NavItem>

          <NavItem to="/profile">
            <i className="fas fa-user mr-3"></i>
            Профиль
          </NavItem>

          <NavItem to="/my-posts">
            <i className="fas fa-file-alt mr-3"></i>
            Мои посты
          </NavItem>

          <NavItem to="/my-likes">
            <i className="fas fa-heart mr-3"></i>
            Мои лайки
          </NavItem>

          <NavItem to="/my-comments">
            <i className="fas fa-comments mr-3"></i>
            Мои комментарии
          </NavItem>
        </nav>

        /* Профиль пользователя */
        <div className="p-4 border-t border-base-300">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={avatarUrl}
              alt={user?.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-base-content">
                {user?.fullName}
              </h3>
              <p className="text-sm text-base-content/60">
                @{user?.username}
              </p>
            </div>
          </div>

          /* Управление */
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
              title="Выйти"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </motion.div>

      /* Модальное окно создания поста */
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            // Можно добавить рефреш или редирект
          }}
        />
      )}
    </>
  );
}