// src/components/Sidebar.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import CreatePostModal from '@/components/CreatePostModal';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarUrl } from '@/utils/avatar';

const NavItem = ({ to, children, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="btn btn-md justify-start w-full text-left text-base font-medium transition-all duration-200 btn-ghost hover:bg-primary/10 hover:scale-[1.02]"
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
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleCreatePostSuccess = () => {
    setShowCreatePost(false);
    navigate('/'); // Перенаправляем на главную страницу после создания поста
  };

  const avatarUrl = user?.profile?.profilePictureUrl
    ? getAvatarUrl(user.profile.profilePictureUrl)
    : '/avatar.png';

  return (
    <>
      <motion.aside
        className="hidden lg:flex lg:w-80 bg-base-100/80 backdrop-blur-sm border-r border-base-300/50 flex-col h-screen sticky top-0"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full p-6">
          {/* Логотип */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NavLink
              to="/"
              className="flex items-center gap-3 text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-blog text-lg"></i>
              </div>
              BlogPlatform
            </NavLink>
          </motion.div>

          {/* Навигация */}
          <nav className="flex-1 space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NavItem to="/">
                <i className="fas fa-home w-5 text-center mr-3"></i>
                Главная
              </NavItem>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <NavItem onClick={() => setShowCreatePost(true)}>
                <i className="fas fa-plus w-5 text-center mr-3"></i>
                Создать пост
              </NavItem>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <NavItem to="/profile">
                <i className="fas fa-user w-5 text-center mr-3"></i>
                Профиль
              </NavItem>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <NavItem to="/search">
                <i className="fas fa-search w-5 text-center mr-3"></i>
                Поиск
              </NavItem>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <NavItem to="/notifications">
                <i className="fas fa-bell w-5 text-center mr-3"></i>
                Уведомления
              </NavItem>
            </motion.div>
          </nav>

          {/* Профиль пользователя */}
          <motion.div
            className="mt-auto space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ThemeToggle />
            
            {user && (
              <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-4 border border-base-300/30">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={avatarUrl}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base-content truncate">{user.fullName}</p>
                    <p className="text-sm text-base-content/60 truncate">@{user.username}</p>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm w-full text-error hover:bg-error/10"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Выйти
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.aside>

      {/* Модальное окно создания поста */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onCreated={handleCreatePostSuccess}
        />
      )}
    </>
  );
}